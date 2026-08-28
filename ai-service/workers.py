# import asyncio
# import os
# from dotenv import load_dotenv
# from bullmq import Worker
# # Import our new modules!
# from ingestion.extractor import extract_content
# from ingestion.sanitizer import sanitize_text

# load_dotenv()

# # This is the function that actually processes the job
# # async def process_job(job, job_token):
# #     print(f"ðŸš€ Received job: {job.id}")
# #     print(f"ðŸ“¦ Payload from Node.js: {job.data}")

# #     # Simulating work (e.g., extracting text, calling LLM)
# #     await asyncio.sleep(2)

# #     # Update progress (your Node teammate can listen for this!)
# #     await job.updateProgress(50)
# #     print("â³ Job 50% complete...")

# #     await asyncio.sleep(2)

# #     print(f"âœ… Job {job.id} completed successfully!")
# #     return {"status": "success", "message": "Content generated!"}

# async def process_job(job, job_token):
#     print(f"\nðŸš€ Starting job: {job.id}")

#     # 1. Get the file path from the payload your Node teammate sends
#     file_path = job.data.get("file_path")

#     if not file_path:
#         return {"status": "error", "message": "No file_path provided in job"}

#     try:
#         # 2. Extraction Phase
#         print(f"ðŸ“„ Extracting content from: {file_path}")
#         raw_text = extract_content(file_path)
#         await job.updateProgress(20)

#         # 3. Sanitization Phase
#         print("ðŸ›¡ï¸ Sanitizing extracted text...")
#         clean_text = sanitize_text(raw_text)
#         await job.updateProgress(40)

#         print(f"âœ… Ingestion complete! Extracted {len(clean_text)} clean characters.")

#         # (In the next step, we will pass `clean_text` to the chunker and vector DB)

#         return {"status": "success", "extracted_length": len(clean_text)}

#     except Exception as e:
#         print(f"âŒ Job failed: {str(e)}")
#         return {"status": "error", "message": str(e)}

# async def main():
#     redis_opts = {
#         "host": os.getenv("REDIS_HOST", "localhost"),
#         "port": int(os.getenv("REDIS_PORT", 6379))
#     }

#     # "ai-jobs-queue" must match exactly what your Node teammate calls the queue
#     worker = Worker("ai-jobs-queue", process_job, {"connection": redis_opts})

#     print("ðŸ‘· Python Worker is running and waiting for jobs...")

#     # Keep the worker running forever
#     while True:
#         await asyncio.sleep(1)

# if __name__ == "__main__":
#     asyncio.run(main())

# # Temporary test
# print(sanitize_text(extract_content("test.pdf")))



import asyncio
import os
from dotenv import load_dotenv
from bullmq import Worker

# Import our custom pipeline modules
from ingestion.extractor import extract_content
from ingestion.sanitizer import sanitize_text
from rag.chunker import chunk_text
from rag.vector_store import LocalRAGStore
from generation.generator import generate_all_formats
from generation.validator import validate_citations
from security.guardrails import PromptGuard
from security.logger import audit_log

load_dotenv()

# Load the heavy AI model once at startup, not on every job
print("â³ Initializing AI Models...")
rag_store = LocalRAGStore()

async def process_job(job, job_token):
    print(f"\nðŸš€ [JOB {job.id}] Started processing...")

    # 1. Parse Node.js payload
    file_path = job.data.get("file_path")
    target_formats = job.data.get("target_formats", ["summary", "linkedin"])

    if not file_path:
        return {"status": "error", "message": "Missing file_path"}

    try:
        # Phase 1: Secure Ingestion (0-20%)
        print(f"ðŸ“„ [JOB {job.id}] Extracting & Sanitizing...")
        raw_text = extract_content(file_path)
        clean_text = sanitize_text(raw_text)
        await job.updateProgress(20)

        # Phase 2: RAG / Chunking (20-40%)
        print(f"âœ‚ï¸ [JOB {job.id}] Chunking & Embedding...")
        chunks = chunk_text(clean_text, chunk_size=300, overlap=50)

        # Clear previous job's data and add new chunks
        rag_store.index.reset()
        rag_store.chunk_map.clear()
        rag_store.current_id = 0
        rag_store.add_chunks(chunks)
        await job.updateProgress(40)

        # Phase 3: Retrieval & Generation (40-80%)
        # Note: In a real app, you'd tailor the search query per format.
        # Here we use a general summary search for the hackathon MVP.
        print(f"ðŸ§  [JOB {job.id}] Retrieving Context & Generating AI Formats...")
        retrieved_context = rag_store.search("Summarize the key objectives and main points.", top_k=5)

        generated_outputs = await generate_all_formats(retrieved_context, target_formats)
        await job.updateProgress(80)

        # Phase 4: Validation & Formatting (80-100%)
        print(f"ðŸ›¡ï¸ [JOB {job.id}] Validating Citations...")
        final_payload = {}

        for fmt, pydantic_data in generated_outputs.items():
            validation = validate_citations(pydantic_data, retrieved_context)
            final_payload[fmt] = {
                "content": pydantic_data.model_dump(),
                "audit": validation
            }

        await job.updateProgress(100)
        print(f"âœ… [JOB {job.id}] Complete!")

        # This return value is saved in Redis! Node.js can read it.
        return {"status": "review_pending", "results": final_payload}

    except Exception as e:
        print(f"âŒ [JOB {job.id}] Failed: {str(e)}")
        return {"status": "error", "message": str(e)}

async def main():
    # redis_opts = {
    #     # "host": os.getenv("REDIS_HOST", "localhost"),
    #     # "port": int(os.getenv("REDIS_PORT", 6379))

    #         "host": os.getenv("REDIS_HOST"),
    #         "port": int(os.getenv("REDIS_PORT", 6379)),
    #         "password": os.getenv("REDIS_PASSWORD"),
    #         "tls": {}  # Required for Upstash TLS connection
    #  }
    # Change "tls": {} to "ssl": True
    redis_opts = {
    "host": os.getenv("REDIS_HOST").strip(),  # .strip() removes accidental hidden spaces!
    "port": int(os.getenv("REDIS_PORT", 6379)),
    "password": os.getenv("REDIS_PASSWORD").strip(),
    "ssl": True
}
    worker = Worker("ai-jobs-queue", process_job, {"connection": redis_opts})
    print("ðŸ‘· Python Orchestrator is running and waiting for jobs...")

    while True:
        await asyncio.sleep(1)

async def process_job(job):
    print(f"âš™ï¸ Processing job {job.id}...")

    file_path = job.data.get("file_path")
    target_formats = job.data.get("target_formats")
    requester_id = job.data.get("requester_id", "unknown_user")

    # ---------------------------------------------------------
    # 1. Extract text from the PDF (You likely already have this part)
    # ---------------------------------------------------------
    extracted_text = extract_content(file_path)

    # ---------------------------------------------------------
    # 2. THE SECURITY CIRCUIT BREAKER (New Code)
    # ---------------------------------------------------------
    print("ðŸ”’ Running security scan on document text...")
    security_check = PromptGuard.is_safe(extracted_text)

    if not security_check["safe"]:
        # Log the attack in structured JSON
        audit_log.warning("Prompt Injection Blocked", extra={
            "extra_data": {
                "job_id": job.id,
                "requester_id": requester_id,
                "threat": security_check["flagged_pattern"],
                "file": file_path
            }
        })
        # Raising an exception automatically marks the BullMQ job as FAILED
        raise ValueError("Security Violation: Malicious instructions detected in document.")

    # Log successful validation
    audit_log.info("Document Validated", extra={
        "extra_data": {"job_id": job.id, "status": "Clean"}
    })

    # ---------------------------------------------------------
    # 3. Proceed to RAG and Generation (Your existing code)
    # ---------------------------------------------------------
    print("âœ… Document is safe. Proceeding to RAG chunking...")
    # chunks = chunk_text(extracted_text...)
    # ... rest of your generation logic ...

if __name__ == "__main__":
    asyncio.run(main())
