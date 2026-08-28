# test_ingestion.py
from ingestion.extractor import extract_content
from ingestion.sanitizer import sanitize_text

# 1. Rips text from your test.pdf
raw = extract_content("test.pdf")

# 2. Cleans prompt injections & bad chars
clean = sanitize_text(raw)

print("--- RAW EXTRACTED TEXT (FIRST 200 CHARS) ---")
print(raw[:200])

print("\n--- SANITIZED TEXT (FIRST 200 CHARS) ---")
print(clean[:200])

print(f"\nTotal clean characters: {len(clean)}")
