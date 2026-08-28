import asyncio
import os
from dotenv import load_dotenv
from bullmq import Queue

load_dotenv()

async def push_test_job():
   # Change "tls": {} to "ssl": True
    # redis_opts = {
    # "host": os.getenv("REDIS_HOST"),
    # "port": int(os.getenv("REDIS_PORT", 6379)),
    # "password": os.getenv("REDIS_PASSWORD"),
    # "ssl": True  # <-- Correct argument for Python's redis client
    # }
    redis_opts = {
    "host": os.getenv("REDIS_HOST").strip(),  # .strip() removes accidental hidden spaces!
    "port": int(os.getenv("REDIS_PORT", 6379)),
    "password": os.getenv("REDIS_PASSWORD").strip(),
    "ssl": True
}

    # Queue name must match worker.py ("ai-jobs-queue")
    queue = Queue("ai-jobs-queue", {"connection": redis_opts})

    # Payload carrying parameters for our integrated pipeline
    job_payload = {
        "file_path": "test.pdf",
        "target_formats": ["summary", "linkedin"],
        "requester_id": "dev_user_123"
    }

    print("ðŸ“¤ Sending job payload to Redis...")
    job = await queue.add("generate-content-job", job_payload)
    print(f"ðŸš€ Job successfully added to queue with ID: {job.id}")

    await queue.close()

if __name__ == "__main__":
    asyncio.run(push_test_job())
