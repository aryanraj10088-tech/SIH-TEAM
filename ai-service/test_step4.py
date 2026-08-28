import asyncio
from rag.chunker import chunk_text
from rag.vector_store import LocalRAGStore
from generation.generator import generate_all_formats
from generation.validator import validate_citations

async def main():
    doc = """
    The James Webb Space Telescope (JWST) was launched on December 25, 2021.
    It operates at the L2 Lagrange point, roughly 1.5 million kilometers from Earth.
    JWST's primary mirror consists of 18 hexagonal beryllium segments coated in gold.
    Its high sensitivity in the infrared spectrum allows it to observe objects up to 13.6 billion light-years away.
    """

    print("1. Chunking and Indexing...")
    chunks = chunk_text(doc, chunk_size=200, overlap=30)
    store = LocalRAGStore()
    store.add_chunks(chunks)

    print("\n2. Retrieving relevant context for query: 'JWST technical specifications'")
    retrieved = store.search("JWST technical specifications", top_k=3)

    print(f"\n3. Concurrently generating target formats (Summary + LinkedIn)...")
    outputs = await generate_all_formats(retrieved, target_formats=["summary", "linkedin"])

    print("\n================ GENERATION RESULTS ================")
    for fmt, data in outputs.items():
        print(f"\n--- Output Format: {fmt.upper()} ---")
        print(data.model_dump_json(indent=2))

        # Validation Check
        validation = validate_citations(data, retrieved)
        print(f"ðŸ›¡ï¸ Citation Audit: {validation}")

if __name__ == "__main__":
    asyncio.run(main())
