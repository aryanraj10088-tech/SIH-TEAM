import fitz  # This is PyMuPDF
import os
import docx

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        # Open the PDF and iterate through pages
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text("text") + "\n"
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
    return text

def extract_text_from_docx(file_path: str) -> str:
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"❌ Error reading DOCX: {e}")
    return text

def extract_text_from_txt(file_path: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error reading TXT: {e}")
        return ""

def extract_content(file_path: str) -> str:
    """Determines the file type and routes it to the right extractor."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Could not find {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext == '.docx':
        return extract_text_from_docx(file_path)
    elif ext == '.txt':
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
