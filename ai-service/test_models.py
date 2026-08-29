import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("CHECKING GROQ MODELS:")
for model in [
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]:
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say hi in one word."}],
            max_tokens=5,
        )
        print(f"SUCCESS: {model} -> {response.choices[0].message.content.strip()}")
    except Exception as exc:
        print(f"FAILED: {model} - {str(exc)[:150]}")
