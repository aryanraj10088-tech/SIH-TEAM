import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

models_to_test = [
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

for model in models_to_test:
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say hi."}],
            max_tokens=10,
        )
        print(f"SUCCESS: {model} -> {response.choices[0].message.content.strip()[:50]}")
    except Exception as exc:
        print(f"FAILED: {model} - {str(exc)[:150]}")
