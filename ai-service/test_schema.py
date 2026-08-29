import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

schema_example = """{
    "headline": "A concise, impactful summary headline",
    "key_points": [
        "First critical insight from the context",
        "Second critical insight from the context"
    ],
    "action_items": [
        "First recommended action based on the context"
    ],
    "citations": [
        {
            "chunk_id": "1",
            "supporting_text": "Direct quote from the text"
        }
    ]
}"""

prompt = f"""Create an Executive Summary based ONLY on these chunks:

[Chunk ID: 1]
AI is transforming industries. Machine learning enables automation. Deep learning powers vision systems.

Return ONLY this exact JSON structure (no extra fields):
{schema_example}"""

response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "system",
            "content": "You are a factual intelligence generator. Return ONLY valid JSON that matches the requested schema. Do not wrap it in markdown fences or add commentary."
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature=0.2
)

text = response.choices[0].message.content
print("RAW OUTPUT:")
print(repr(text))
print("\nFORMATTED:")
print(text)
