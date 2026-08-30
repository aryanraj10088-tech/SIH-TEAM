import os
import numpy as np

# Check if we are running in a memory-constrained environment (like Render free tier)
# Render automatically injects RENDER="true" into the environment
LIGHTWEIGHT_MODE = os.environ.get("LIGHTWEIGHT_MODE", "false").lower() == "true" or os.environ.get("RENDER", "false").lower() == "true"

class LocalRAGStore:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.chunk_map = {}
        self.current_id = 0
        self.is_lightweight = LIGHTWEIGHT_MODE

        if self.is_lightweight:
            print("🧠 Initializing Lightweight Document Store (Optimized for 512MB RAM)...")
            self.encoder = None
            self.index = None
        else:
            print("🧠 Loading PyTorch & FAISS Embedding Model (this takes a sec on first run)...")
            # We import these ONLY if not in lightweight mode to save 300MB+ RAM
            import faiss
            from sentence_transformers import SentenceTransformer
            
            self.encoder = SentenceTransformer(model_name)
            self.dimension = self.encoder.get_sentence_embedding_dimension()
            self.index = faiss.IndexFlatL2(self.dimension)

    def add_chunks(self, chunks: list[str]):
        """Stores chunks into the database (either FAISS or lightweight in-memory)."""
        if not chunks:
            return

        if self.is_lightweight:
            print(f"🔢 Storing {len(chunks)} chunks directly in memory...")
            for chunk in chunks:
                self.chunk_map[self.current_id] = chunk
                self.current_id += 1
            print(f"✅ Stored {len(chunks)} chunks!")
        else:
            print(f"🔢 Embedding {len(chunks)} chunks with PyTorch...")
            embeddings = self.encoder.encode(chunks)
            embeddings = np.array(embeddings).astype('float32')
            self.index.add(embeddings)
            for chunk in chunks:
                self.chunk_map[self.current_id] = chunk
                self.current_id += 1
            print(f"✅ Stored {len(chunks)} vectors in FAISS!")

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """Searches the database for the most relevant chunks."""
        if not self.chunk_map:
            return []

        results = []
        if self.is_lightweight:
            # Naive retrieval to save RAM on free tiers
            for i in range(min(top_k, len(self.chunk_map))):
                results.append({
                    "chunk_id": str(i),
                    "text": self.chunk_map[i],
                    "distance": 0.0
                })
        else:
            if self.index.ntotal == 0:
                return []
            # Proper Vector RAG Search
            query_vector = self.encoder.encode([query])
            query_vector = np.array(query_vector).astype('float32')
            distances, indices = self.index.search(query_vector, top_k)

            for i, idx in enumerate(indices[0]):
                if idx != -1:
                    results.append({
                        "chunk_id": str(idx),
                        "text": self.chunk_map[idx],
                        "distance": float(distances[0][i])
                    })
        return results
