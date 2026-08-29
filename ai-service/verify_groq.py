import asyncio
from generation.providers.groq import GroqProvider
from generation.schemas import ExecutiveSummaryOutput

async def main():
    provider = GroqProvider()
    prompt = 'Return valid JSON with headline, key_points, action_items, citations for text: AI is a useful tool.'
    result = await provider.generate(prompt, ExecutiveSummaryOutput)
    print('TYPE', type(result).__name__)
    print(result.model_dump_json(indent=2))

asyncio.run(main())
