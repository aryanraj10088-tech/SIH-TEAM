from pydantic import BaseModel, Field
# Add this new import at the very top of schemas.py if it's not there
from typing import List

class Citation(BaseModel):
    chunk_id: str = Field(description="The exact chunk_id retrieved from the vector store that supports this claim")
    supporting_text: str = Field(description="Direct snippet or sentence from the chunk used as evidence")

class VideoScene(BaseModel):
    scene_number: int = Field(description="Sequential scene number")
    narration: str = Field(description="The spoken script for the presenter or AI avatar")
    visual_prompt: str = Field(description="Detailed image/video generation prompt (e.g., for Veo or HeyGen) describing the visuals")
    editing_notes: str = Field(description="Instructions for pacing, micro-trimming, keyframe animations, or transitions (e.g., 'fast cut', 'zoom in')")
    citations: List[Citation] = Field(description="Citations supporting the facts mentioned in this specific scene")

class VideoPackageOutput(BaseModel):
    title: str = Field(description="Catchy title for the video")
    target_audience: str = Field(description="Who this video is made for")
    scenes: List[VideoScene] = Field(description="List of chronological scenes that make up the video")
    global_pacing: str = Field(description="Overall vibe and pacing strategy of the video")

class ExecutiveSummaryOutput(BaseModel):
    headline: str = Field(description="High-level impactful summary headline")
    key_points: list[str] = Field(description="3-5 critical insights extracted from the context")
    action_items: list[str] = Field(description="Recommended next steps based on the text")
    citations: list[Citation] = Field(description="Citations supporting the summary points")

class LinkedInPostOutput(BaseModel):
    hook: str = Field(description="Attention-grabbing opening sentence")
    body: str = Field(description="Engaging main body text formatted with line breaks")
    hashtags: list[str] = Field(description="3-5 relevant hashtags")
    citations: list[Citation] = Field(description="Citations supporting the facts mentioned in the post")
    image_prompts: List[str] = Field(description="Exactly 2 highly detailed, visually descriptive prompts for an AI image generator to accompany this post.")

class AdvisoryOutput(BaseModel):
    title: str = Field(description="Headline title for the advisory document")
    severity_level: str = Field(description="Risk/Urgency level: Critical, High, Medium, or Low")
    executive_summary: str = Field(description="Brief overview of the key advisory findings")
    recommendations: List[str] = Field(description="Key actionable recommendations")
    action_items: List[str] = Field(description="Immediate operational next steps")
