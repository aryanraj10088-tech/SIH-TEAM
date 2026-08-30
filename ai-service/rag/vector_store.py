import numpy as np

class LocalRAGStore:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        print("🧠 Initializing Lightweight Document Store (Optimized for 512MB RAM)...")
        self.chunk_map = {}
        self.current_id = 0

    def add_chunks(self, chunks: list[str]):
        """Stores chunks directly in memory without heavy embeddings."""
        if not chunks:
            return

        print(f"🔢 Storing {len(chunks)} chunks...")
        for chunk in chunks:
            self.chunk_map[self.current_id] = chunk
            self.current_id += 1

        print(f"✅ Stored {len(chunks)} chunks!")

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """Returns the first top_k chunks as context.
        On a 512MB free tier, we avoid PyTorch/Transformers to prevent OOM crashes.
        Modern LLMs have large enough context windows to process these chunks.
        """
        if not self.chunk_map:
            return []

        results = []
        # Return the first top_k chunks (naive retrieval to save 300MB+ RAM)
        for i in range(min(top_k, len(self.chunk_map))):
            results.append({
                "chunk_id": str(i),
                "text": self.chunk_map[i],
                "distance": 0.0
            })
        return results
