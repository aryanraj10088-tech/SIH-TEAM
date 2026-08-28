import fitz  # This is PyMuPDF
import os

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        # Open the PDF and iterate through pages
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text("text") + "\n"
    except Exception as e:
        print(f"âŒ Error reading PDF: {e}")
    return text

def extract_content(file_path: str) -> str:
    """Determines the file type and routes it to the right extractor."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Could not find {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    # Hackathon tip: Add OCR or Word parsers here later!
    else:
        raise ValueError(f"Unsupported file format: {ext}")
