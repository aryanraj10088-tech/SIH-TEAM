from rag.chunker import chunk_text
from rag.vector_store import LocalRAGStore

# 1. Simulate some fake sanitized text (from Step 2)
fake_document = """
The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.
It is named after the engineer Gustave Eiffel, whose company designed and built the tower.

Locally nicknamed "La dame de fer" (French for "Iron Lady"), it was constructed from 1887 to 1889 as the centerpiece of the 1889 World's Fair.
Although initially criticized by some of France's leading artists and intellectuals for its design, it has become a global cultural icon of France.

The tower is 330 metres (1,083 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris.
"""

# 2. Chunk it
print("âœ‚ï¸ Chunking text...")
chunks = chunk_text(fake_document, chunk_size=150, overlap=20)
print(f"Created {len(chunks)} chunks.\n")

# 3. Store it in FAISS
store = LocalRAGStore()
store.add_chunks(chunks)

# 4. Do a search query!
print("\nðŸ” Searching for: 'How tall is the tower?'")
results = store.search("How tall is the tower?", top_k=2)

for res in results:
    print(f"\n[ID: {res['chunk_id']}] (Distance: {res['distance']:.2f})")
    print(res['text'])
