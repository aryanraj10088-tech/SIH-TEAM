import os
import base64
import logging
import urllib.request
import urllib.error
import urllib.parse
import json
import asyncio

logger = logging.getLogger("srijansetu-ai")

import requests

def _generate_image_sync(prompt: str, provider: str, api_key: str) -> str | None:
    if provider == "huggingface":
        url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
        headers = {
            "Content-Type": "application/json"
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
            
        try:
            response = requests.post(url, headers=headers, json={"inputs": prompt}, timeout=60.0)
            if response.status_code == 200:
                return base64.b64encode(response.content).decode('utf-8')
            else:
                logger.error(f"HuggingFace API error: {response.status_code} - {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Image generation request failed: {e}")
            return None
            
    elif provider == "pollinations":
        # Free, no-API-key image generation
        encoded_prompt = urllib.parse.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
        headers = {"User-Agent": "SrijanSetu-AI"}
        try:
            response = requests.get(url, headers=headers, timeout=60.0)
            if response.status_code == 200:
                return base64.b64encode(response.content).decode('utf-8')
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Pollinations image generation failed: {e}")
            return None
            
    else:
        logger.error(f"Unsupported IMAGE_GEN_PROVIDER: {provider}")
        return None

async def generate_image(prompt: str) -> str | None:
    # Defaulting to pollinations so it works instantly without API keys!
    provider = os.getenv("IMAGE_GEN_PROVIDER", "pollinations").lower()
    api_key = os.getenv("IMAGE_GEN_API_KEY", "")
    
    logger.info(f"Generating image using {provider} for prompt: {prompt}")
    return await asyncio.to_thread(_generate_image_sync, prompt, provider, api_key)
