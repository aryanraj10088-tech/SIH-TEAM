import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

models_to_test = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest"
]

for model in models_to_test:
    try:
        response = client.models.generate_content(
            model=model,
            contents="Say hi",
        )
        print(f"SUCCESS: {model}")
    except Exception as e:
        print(f"FAILED: {model} - {str(e)[:150]}")
