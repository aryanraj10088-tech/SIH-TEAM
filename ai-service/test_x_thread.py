import asyncio
import json
from generation.generator import generate_all_formats
from dotenv import load_dotenv

load_dotenv()

async def main():
    context = [
        {"chunk_id": "1", "text": "A new study shows that developers using AI complete tasks 50% faster. This is based on a survey of 1000 professionals."},
        {"chunk_id": "2", "text": "However, they must be careful about prompt injection risks and hallucinations, which can cause severe data breaches."}
    ]
    results = await generate_all_formats(
        context_chunks=context,
        target_formats=["x_thread"],
        audience="Tech professionals",
        tone="Professional but engaging"
    )
    print(json.dumps(results["x_thread"].model_dump(), indent=2))
    
if __name__ == "__main__":
    asyncio.run(main())
