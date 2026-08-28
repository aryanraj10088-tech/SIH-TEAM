import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class LocalRAGStore:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        print("ðŸ§  Loading Embedding Model (this takes a sec on first run)...")
        # This is a fast, lightweight local model perfect for hackathons
        self.encoder = SentenceTransformer(model_name)

        # The dimension size for all-MiniLM-L6-v2 is 384
        self.dimension = self.encoder.get_sentence_embedding_dimension()

        # Initialize FAISS Index (L2 distance means Euclidean distance)
        self.index = faiss.IndexFlatL2(self.dimension)

        # Dictionary to map FAISS integer IDs back to the actual text chunks
        self.chunk_map = {}
        self.current_id = 0

    def add_chunks(self, chunks: list[str]):
        """Converts text to vectors and adds them to the FAISS database."""
        if not chunks:
            return

        print(f"ðŸ”¢ Embedding {len(chunks)} chunks...")
        # Convert text to numpy array of vectors
        embeddings = self.encoder.encode(chunks)
        embeddings = np.array(embeddings).astype('float32')

        # Store in FAISS
        self.index.add(embeddings)

        # Map the text to the IDs so we can retrieve them later
        for chunk in chunks:
            self.chunk_map[self.current_id] = chunk
            self.current_id += 1

        print(f"âœ… Stored {len(chunks)} vectors in FAISS!")

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """Searches the database for the most relevant chunks."""
        if self.index.ntotal == 0:
            return []

        # 1. Embed the user's query
        query_vector = self.encoder.encode([query])
        query_vector = np.array(query_vector).astype('float32')

        # 2. Search FAISS
        distances, indices = self.index.search(query_vector, top_k)

        # 3. Retrieve the actual text
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1:  # FAISS returns -1 if it doesn't find enough results
                results.append({
                    "chunk_id": str(idx),
                    "text": self.chunk_map[idx],
                    "distance": float(distances[0][i])
                })
        return results
