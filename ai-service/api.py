import os
import sys
import tempfile
import logging
from pathlib import Path
from urllib.request import Request, urlopen

# Force UTF-8 encoding for stdout and stderr to prevent UnicodeEncodeError on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ingestion.extractor import extract_content
from ingestion.sanitizer import sanitize_text
from security.guardrails import PromptGuard

app = FastAPI(title="SrijanSetu AI Orchestrator")
logger = logging.getLogger("srijansetu-ai")


class GenerateRequest(BaseModel):
    source_url: str = Field(min_length=1)
    target_formats: list[str] = Field(min_length=1)
    source_mime_type: str | None = None
    audience: str | None = None
    tone: str | None = None
    detail_level: str | None = None
    objective: str | None = None
    language: str | None = None


import requests

def download_source(source_url: str, destination: Path) -> None:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "*/*"
    }
    
    with requests.get(source_url, headers=headers, stream=True, timeout=60) as response:
        response.raise_for_status()
        with destination.open("wb") as output:
            total = 0
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    total += len(chunk)
                    if total > 10 * 1024 * 1024:
                        raise ValueError("Source exceeds the 10MB processing limit")
                    output.write(chunk)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "online", "service": "srijansetu-ai-orchestrator"}


@app.post("/api/generate")
async def generate(request: GenerateRequest) -> dict:
    supported_formats = {"summary", "linkedin", "video", "advisory", "x_thread"}
    if any(output_format not in supported_formats for output_format in request.target_formats):
        raise HTTPException(status_code=400, detail="Unsupported output format")

    with tempfile.TemporaryDirectory(prefix="srijansetu-source-") as temp_dir:
        ext = ".pdf"
        if request.source_mime_type:
            mime = request.source_mime_type.lower()
            if "wordprocessingml" in mime or "docx" in mime:
                ext = ".docx"
            elif "text/plain" in mime:
                ext = ".txt"
            elif "pdf" not in mime:
                raise HTTPException(status_code=400, detail=f"Unsupported source format: {request.source_mime_type}")
        
        source_path = Path(temp_dir) / f"source{ext}"
        try:
            download_source(request.source_url, source_path)
            raw_text = extract_content(str(source_path))
            if not raw_text.strip():
                raise ValueError("The source contains no extractable text")

            clean_text = sanitize_text(raw_text)
            security_check = PromptGuard.is_safe(clean_text)
            if not security_check["safe"]:
                raise HTTPException(status_code=422, detail="Source blocked by prompt-injection guard")

            from generation.generator import generate_all_formats
            from generation.validator import validate_citations
            from rag.chunker import chunk_text
            from rag.vector_store import LocalRAGStore

            chunks = chunk_text(clean_text, chunk_size=300, overlap=50)
            rag_store = LocalRAGStore()
            rag_store.add_chunks(chunks)
            context = rag_store.search(
                "Summarize the key objectives and main points.", top_k=5
            )
            generated = await generate_all_formats(
                context,
                request.target_formats,
                audience=request.audience,
                tone=request.tone,
                detail_level=request.detail_level,
                objective=request.objective,
                language=request.language,
            )

            results = {}
            for output_format, output in generated.items():
                results[output_format] = {
                    "content": output.model_dump(),
                    "audit": validate_citations(output, context),
                }
            return {"status": "review_pending", "results": results}
        except HTTPException:
            raise
        except Exception as error:
            if hasattr(error, "status_code") and getattr(error, "status_code") == 429:
                raise HTTPException(
                    status_code=429,
                    detail=(
                        "Groq API quota exceeded. Wait for the quota to reset."
                    ),
                )
            logger.exception("Generation pipeline failed: %s", error)
            raise HTTPException(status_code=502, detail=f"Generation pipeline failed: {str(error)}")
