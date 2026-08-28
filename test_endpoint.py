import requests
import time

start = time.time()
try:
    print("Sending request...")
    response = requests.post(
        "http://127.0.0.1:8000/api/generate",
        json={
            "source_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "target_formats": ["summary", "linkedin"]
        },
        timeout=60
    )
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    print(f"Time taken: {time.time() - start:.2f} seconds")
