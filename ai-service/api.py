import os
import tempfile
import logging
from pathlib import Path
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ingestion.extractor import extract_content
from ingestion.sanitizer import sanitize_text
from security.guardrails import PromptGuard

app = FastAPI(title="NEXUS AI Orchestrator")
logger = logging.getLogger("nexus-ai")


class GenerateRequest(BaseModel):
    source_url: str = Field(min_length=1)
    target_formats: list[str] = Field(min_length=1)


def download_source(source_url: str, destination: Path) -> None:
    request = Request(source_url, headers={"User-Agent": "NEXUS-AI-Service/1.0"})
    with urlopen(request, timeout=60) as response, destination.open("wb") as output:
        total = 0
        while chunk := response.read(1024 * 1024):
            total += len(chunk)
            if total > 10 * 1024 * 1024:
                raise ValueError("Source exceeds the 10MB processing limit")
            output.write(chunk)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "online", "service": "nexus-ai-orchestrator"}


@app.post("/api/generate")
async def generate(request: GenerateRequest) -> dict:
    supported_formats = {"summary", "linkedin", "video"}
    if any(output_format not in supported_formats for output_format in request.target_formats):
        raise HTTPException(status_code=400, detail="Unsupported output format")

    with tempfile.TemporaryDirectory(prefix="nexus-source-") as temp_dir:
        source_path = Path(temp_dir) / "source.pdf"
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
            generated = await generate_all_formats(context, request.target_formats)

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
            logger.exception("Generation pipeline failed: %s", error)
            raise HTTPException(status_code=502, detail="Generation pipeline failed") from error
