import asyncio
from rag.chunker import chunk_text
from rag.vector_store import LocalRAGStore
from generation.generator import generate_all_formats

async def main():
    # A fun, complex document to test our energetic video script generation
    doc = """
    Resonance in an AC circuit occurs when the inductive reactance equals the capacitive reactance,
    causing them to cancel each other out. At this specific resonant frequency, the circuit's overall
    impedance is at its absolute minimum, and it acts purely resistively. This allows the maximum
    possible current to flow through the circuit from the power source. Resonance is the fundamental
    principle used in tuning radios and TVs to pick up a specific broadcasting frequency while ignoring others.
    """

    print("1. Chunking and Indexing...")
    chunks = chunk_text(doc, chunk_size=300, overlap=50)
    store = LocalRAGStore()
    store.add_chunks(chunks)

    print("\n2. Retrieving context...")
    retrieved = store.search("AC circuit resonance and tuning", top_k=3)

    print("\n3. Generating Video Package...")
    # Notice we added "video" to the target formats!
    outputs = await generate_all_formats(retrieved, target_formats=["video"])

    print("\n================ GENERATED VIDEO PACKAGE ================")
    # Print the beautiful nested JSON
    print(outputs["video"].model_dump_json(indent=2))

if __name__ == "__main__":
    asyncio.run(main())
