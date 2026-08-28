from pydantic import BaseModel
import asyncio
from generation.providers import GeminiProvider

# Initialize the default LLM provider
llm_provider = GeminiProvider()

async def generate_single_format(prompt: str, schema: type[BaseModel]):
    """Helper to run a structured LLM call asynchronously using the configured provider."""
    return await llm_provider.generate(prompt, schema)

# async def generate_all_formats(context_chunks: list[dict], target_formats: list[str]) -> dict:
#     """Executes format-specific generations concurrently using asyncio.gather."""

#     formatted_context = "\n\n".join(
#         [f"[Chunk ID: {c['chunk_id']}]\n{c['text']}" for c in context_chunks]
#     )

#     tasks = {}

#     if "summary" in target_formats:
#         prompt = f"Create an Executive Summary based ONLY on these chunks:\n\n{formatted_context}"
#         tasks["summary"] = generate_single_format(prompt, ExecutiveSummaryOutput)

#     if "linkedin" in target_formats:
#         prompt = f"Create an engaging LinkedIn Post based ONLY on these chunks:\n\n{formatted_context}"
#         tasks["linkedin"] = generate_single_format(prompt, LinkedInPostOutput)

#     # Run concurrent calls
#     keys = list(tasks.keys())
#     results = await asyncio.gather(*tasks.values())

#     return dict(zip(keys, results))

# 1. Update your imports at the top to include the new schema
from generation.schemas import ExecutiveSummaryOutput, LinkedInPostOutput, VideoPackageOutput, AdvisoryOutput

# ... (Keep generate_single_format exactly the same) ...

# 2. Update generate_all_formats to handle the video task
async def generate_all_formats(context_chunks: list[dict], target_formats: list[str], config: any = None) -> dict:
    """Executes format-specific generations concurrently using asyncio.gather."""

    formatted_context = "\n\n".join(
        [f"[Chunk ID: {c['chunk_id']}]\n{c['text']}" for c in context_chunks]
    )

    config_str = ""
    if config:
        config_str += f"\n\nCONFIGURATION INSTRUCTIONS:\n"
        if hasattr(config, 'audience') and config.audience:
            config_str += f"- Target Audience: {config.audience}\n"
        if hasattr(config, 'tone') and config.tone:
            config_str += f"- Tone: {config.tone}\n"
        if hasattr(config, 'detail') and config.detail:
            config_str += f"- Detail Level: {config.detail}\n"
        if hasattr(config, 'objective') and config.objective:
            config_str += f"- Objective: {config.objective}\n"
        if hasattr(config, 'language') and config.language:
            config_str += f"- Language: {config.language}\n"

    tasks = {}

    if "summary" in target_formats:
        prompt = f"Create an Executive Summary based ONLY on these chunks:\n\n{formatted_context}{config_str}"
        tasks["summary"] = generate_single_format(prompt, ExecutiveSummaryOutput)

    if "linkedin" in target_formats:
        prompt = f"Create an engaging LinkedIn Post based ONLY on these chunks:\n\n{formatted_context}{config_str}"
        tasks["linkedin"] = generate_single_format(prompt, LinkedInPostOutput)

    if "advisory" in target_formats:
        prompt = f"Create a structured Advisory Document based ONLY on these chunks:\n\n{formatted_context}{config_str}"
        tasks["advisory"] = generate_single_format(prompt, AdvisoryOutput)

    if "video" in target_formats:
        prompt = (
            f"Create a highly engaging, dynamic educational video script based ONLY on these chunks. "
            f"Write the narration in an energetic, analogy-driven style. Provide detailed visual prompts "
            f"for AI avatar generation, and give clear video editing instructions for pacing and transitions.\n\n"
            f"Context:\n{formatted_context}{config_str}"
        )
        tasks["video"] = generate_single_format(prompt, VideoPackageOutput)

    # Run sequential calls to prevent Gemini Free Tier rate limits
    keys = list(tasks.keys())
    results = []
    
    try:
        for task in tasks.values():
            results.append(await task)
            await asyncio.sleep(5) # Delay to prevent rate limiting
    except Exception as e:
        raise e
    finally:
        for task in tasks.values():
            task.close()

    return dict(zip(keys, results))
