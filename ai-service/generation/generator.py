import os
import json
import asyncio
from pydantic import BaseModel

from generation.providers import GroqProvider
from generation.schemas import (
    ExecutiveSummaryOutput,
    LinkedInPostOutput,
    AdvisoryOutput,
    VideoPackageOutput
)

# Initialize the default LLM provider
llm_provider = GroqProvider()

async def generate_single_format(prompt: str, schema: type[BaseModel]):
    """Helper to run a structured LLM call asynchronously using Groq Provider."""
    return await llm_provider.generate(prompt, schema)


def _get_schema_instruction(schema_name: str) -> str:
    """Return explicit JSON schema instructions for the model with full examples."""
    schemas = {
        "ExecutiveSummaryOutput": """REQUIRED JSON OUTPUT FORMAT (return ONLY valid JSON, no other text):
{
    "headline": "A concise, impactful summary headline",
    "key_points": [
        "First critical insight from the context",
        "Second critical insight from the context",
        "Third critical insight from the context"
    ],
    "action_items": [
        "First recommended action based on the context",
        "Second recommended action based on the context"
    ],
    "citations": [
        {
            "chunk_id": "1",
            "supporting_text": "Direct quote or snippet from chunk 1 that supports a claim"
        },
        {
            "chunk_id": "2", 
            "supporting_text": "Direct quote or snippet from chunk 2 that supports a claim"
        }
    ]
}""",
        "LinkedInPostOutput": """REQUIRED JSON OUTPUT FORMAT (return ONLY valid JSON, no other text):
{
    "hook": "A compelling opening line that grabs attention",
    "body": "The main content with line breaks.\\nMake it engaging and professional.\\nUse natural formatting.",
    "hashtags": ["#Innovation", "#Technology", "#Growth"],
    "citations": [
        {
            "chunk_id": "1",
            "supporting_text": "Direct evidence from the source"
        }
    ],
    "image_prompts": [
        "A detailed, visually descriptive prompt for an AI image generator showing [concept] in [style]",
        "Another detailed visual prompt for a second complementary image"
    ]
}""",
        "AdvisoryOutput": """REQUIRED JSON OUTPUT FORMAT (return ONLY valid JSON, no other text):
{
    "title": "Advisory: Clear Issue or Risk Statement",
    "severity_level": "High",
    "executive_summary": "A brief, direct summary of the advisory findings and implications",
    "recommendations": [
        "First key recommendation to address the issue",
        "Second key recommendation to address the issue"
    ],
    "action_items": [
        "Immediate operational action step 1",
        "Immediate operational action step 2"
    ]
}""",
        "VideoPackageOutput": """REQUIRED JSON OUTPUT FORMAT (return ONLY valid JSON, no other text):
{
    "title": "Catchy and engaging video title",
    "target_audience": "Describe who this video is for",
    "scenes": [
        {
            "scene_number": 1,
            "narration": "The exact spoken script for this scene",
            "visual_prompt": "Detailed visual description for AI image/video generation",
            "editing_notes": "Specific pacing, cuts, transitions, timing cues",
            "citations": [
                {
                    "chunk_id": "1",
                    "supporting_text": "Direct evidence supporting claims in this scene"
                }
            ]
        }
    ],
    "global_pacing": "Description of the overall vibe: energetic, slow-build, dramatic, etc."
}""",
    }
    return schemas.get(schema_name, "")


async def generate_all_formats(
    context_chunks: list[dict],
    target_formats: list[str],
    audience: str | None = None,
    tone: str | None = None,
    detail_level: str | None = None,
    objective: str | None = None,
    language: str | None = None,
) -> dict:
    """Executes format-specific generations sequentially."""

    formatted_context = "\n\n".join(
        [f"[Chunk ID: {c['chunk_id']}]\n{c['text']}" for c in context_chunks]
    )
    preferences = "\n".join(
        value for value in [
            f"Audience: {audience}" if audience else "",
            f"Tone: {tone}" if tone else "",
            f"Detail level: {detail_level}" if detail_level else "",
            f"Objective: {objective}" if objective else "",
            f"Language: {language}" if language else "",
        ] if value
    )
    instructions = f"\nGeneration preferences:\n{preferences}\n" if preferences else ""
    config_str = instructions

    tasks = {}

    if "summary" in target_formats:
        prompt = (
            f"Create an Executive Summary based ONLY on these chunks:\n\n{formatted_context}{config_str}\n\n"
            f"Return ONLY this exact JSON structure (no extra fields):\n{_get_schema_instruction('ExecutiveSummaryOutput')}"
        )
        tasks["summary"] = generate_single_format(prompt, ExecutiveSummaryOutput)

    if "linkedin" in target_formats:
        prompt = (
            f"Create an engaging LinkedIn Post based ONLY on these chunks:\n\n{formatted_context}{config_str}\n\n"
            f"Return ONLY this exact JSON structure (no extra fields):\n{_get_schema_instruction('LinkedInPostOutput')}"
        )
        tasks["linkedin"] = generate_single_format(prompt, LinkedInPostOutput)

    if "advisory" in target_formats:
        prompt = (
            f"Create a structured Advisory Document based ONLY on these chunks:\n\n{formatted_context}{config_str}\n\n"
            f"Return ONLY this exact JSON structure (no extra fields):\n{_get_schema_instruction('AdvisoryOutput')}"
        )
        tasks["advisory"] = generate_single_format(prompt, AdvisoryOutput)

    if "video" in target_formats:
        prompt = (
            f"Create a highly engaging, dynamic educational video script based ONLY on these chunks. "
            f"Write the narration in an energetic, analogy-driven style. Provide detailed visual prompts "
            f"for AI avatar generation, and give clear video editing instructions for pacing and transitions.\n\n"
            f"Context:\n{formatted_context}{config_str}\n\n"
            f"Return ONLY this exact JSON structure (no extra fields):\n{_get_schema_instruction('VideoPackageOutput')}"
        )
        tasks["video"] = generate_single_format(prompt, VideoPackageOutput)

    keys = list(tasks.keys())
    results = []
    
    for task in tasks.values():
        try:
            results.append(await task)
            await asyncio.sleep(1)  # Shorter delay between calls
        except Exception as e:
            raise e

    return dict(zip(keys, results))
