from pydantic import BaseModel, Field
# Add this new import at the very top of schemas.py if it's not there
from typing import List

class Citation(BaseModel):
    chunk_id: str | None = Field(default=None, description="The exact chunk_id retrieved from the vector store")
    supporting_text: str = Field(description="Direct snippet or sentence from the source used as evidence")
    claim_supported: str | None = Field(default=None, description="The specific generated claim this evidence supports")
    source_name: str | None = Field(default=None, description="Name of the document or source")

class VideoScene(BaseModel):
    scene_number: int = Field(description="Sequential scene number")
    duration: str | int | None = Field(default=None, description="Estimated duration in seconds or format like '8s'")
    scene_title: str | None = Field(default=None, description="Title of the scene")
    narration: str = Field(description="The spoken script for the presenter or AI avatar")
    on_screen_text: str | None = Field(default=None, description="Text to overlay on the screen")
    subtitles: str | None = Field(default=None, description="Subtitle text for this scene (do not invent timestamps)")
    visual_description: str | None = Field(default=None, description="What should appear in the actual scene")
    visual_prompt: str = Field(description="Detailed generative prompt for AI image/video tools")
    editing_notes: str = Field(description="Instructions for pacing, micro-trimming, keyframe animations")
    transition: str | None = Field(default=None, description="Transition from previous scene")
    audio_direction: str | None = Field(default=None, description="Audio/Music direction or sound effects")
    source_reference: str | None = Field(default=None, description="Source reference for factual claims")
    content_warnings: List[str] | None = Field(default=None, description="Missing data warnings")
    citations: List[Citation] | None = Field(default=None, description="Citations supporting the facts")

class VideoPackageOutput(BaseModel):
    title: str = Field(description="Catchy title for the video")
    objective: str | None = Field(default=None, description="Objective of the video")
    target_audience: str = Field(description="Who this video is made for")
    tone: str | None = Field(default=None, description="Overall tone")
    language: str | None = Field(default=None, description="Primary language")
    duration: str | int | None = Field(default=None, description="Estimated total duration")
    overall_message: str | None = Field(default=None, description="Core message of the video")
    global_pacing: str = Field(description="Overall vibe and pacing strategy of the video")
    content_warnings: List[str] | None = Field(default=None, description="Missing data warnings")
    scenes: List[VideoScene] = Field(description="List of chronological scenes that make up the video")

class SummaryActionItem(BaseModel):
    action: str = Field(description="Action item text")
    priority: str | None = Field(default=None, description="Priority level if supported by source")
    responsible_role: str | None = Field(default=None, description="Responsible role (Do not invent)")
    timeframe: str | None = Field(default=None, description="Timeframe or deadline (Do not invent)")
    rationale: str | None = Field(default=None, description="Rationale for action")

class ExecutiveSummaryOutput(BaseModel):
    headline: str = Field(description="High-level impactful summary headline")
    executive_overview: str = Field(description="Concise decision-oriented overview of the issue")
    key_points: list[str] = Field(description="Prioritized factual insights extracted from the context")
    action_items: list[SummaryActionItem] = Field(description="Recommended next steps based on the text")
    target_audience: str | None = Field(default=None, description="Target Audience")
    communication_objective: str | None = Field(default=None, description="Communication Objective")
    level_of_detail: str | None = Field(default=None, description="Level of Detail")
    content_warnings: List[str] | None = Field(default=None, description="Warnings if critical source data is missing")
    citations: list[Citation] = Field(description="Citations supporting the summary points")

class LinkedInPostOutput(BaseModel):
    hook: str = Field(description="Attention-grabbing opening sentence")
    body: str = Field(description="Engaging main body text formatted with logical paragraph breaks")
    hashtags: list[str] = Field(description="3-5 relevant, deduplicated hashtags")
    target_audience: str | None = Field(default=None, description="Target Audience")
    tone: str | None = Field(default=None, description="Post Tone")
    communication_objective: str | None = Field(default=None, description="Communication Objective")
    language: str | None = Field(default=None, description="Target Language")
    call_to_action: str | None = Field(default=None, description="Call to Action string")
    content_warnings: List[str] | None = Field(default=None, description="Warnings if source data is insufficient for a strong post")
    citations: list[Citation] = Field(description="Citations supporting the facts mentioned in the post")
    image_prompts: List[str] = Field(description="Exactly 2 highly detailed, visually descriptive prompts for an AI image generator to accompany this post.")

class AdvisoryKeyFinding(BaseModel):
    finding: str = Field(description="Concise factual point extracted from the source")
    source_reference: str | None = Field(default=None, description="Source reference for this finding")
    citations: List[Citation] | None = Field(default=None, description="Citations supporting this specific finding")

class AdvisoryImpact(BaseModel):
    affected_groups: List[str] | None = Field(default=None, description="Groups or systems affected")
    operational_impact: str | None = Field(default=None, description="Operational impact described in source")
    potential_consequences: str | None = Field(default=None, description="Potential consequences")
    risk_factors: List[str] | None = Field(default=None, description="Risk factors")
    urgency: str | None = Field(default=None, description="Urgency of the situation")

class AdvisoryRecommendation(BaseModel):
    recommendation: str = Field(description="Actionable recommendation")
    priority: str | None = Field(default=None, description="Priority level if supported by source")
    rationale: str | None = Field(default=None, description="Rationale for the recommendation")
    responsible_role: str | None = Field(default=None, description="Responsible audience or role (Do not invent)")
    source_reference: str | None = Field(default=None, description="Source reference")
    citations: List[Citation] | None = Field(default=None, description="Citations from the source that prompted this recommendation (distinct from the recommendation itself)")

class AdvisoryActionItem(BaseModel):
    action: str = Field(description="Specific action item")
    priority: str | None = Field(default=None, description="Priority level")
    responsible_role: str | None = Field(default=None, description="Responsible role (Do not invent)")
    timeframe: str | None = Field(default=None, description="Timeframe or deadline (Do not invent)")
    status: str | None = Field(default=None, description="Status of the action item")
    rationale: str | None = Field(default=None, description="Rationale")

class AdvisoryAudienceGuidance(BaseModel):
    audience: str = Field(description="Target audience category")
    guidance: str = Field(description="Specific guidance for this audience")

class AdvisorySource(BaseModel):
    reference: str = Field(description="Name or description of the source")
    url_or_location: str | None = Field(default=None, description="Where this was found in the context")

class AdvisoryOutput(BaseModel):
    title: str = Field(description="Headline title for the advisory document")
    advisory_id: str | None = Field(default=None, description="Reference identifier if supported by source")
    severity_level: str = Field(description="Risk/Urgency level: Critical, High, Medium, Low, or 'Not specified in source'")
    status: str | None = Field(default=None, description="Status of the advisory")
    issue_category: str | None = Field(default=None, description="Issue type or category")
    issued_date: str | None = Field(default=None, description="Issued date (Do not invent)")
    valid_until: str | None = Field(default=None, description="Applicability period (Do not invent)")
    target_audience: str | None = Field(default=None, description="Target audience")
    geographic_scope: str | None = Field(default=None, description="Geographic scope (Do not invent)")
    executive_summary: str = Field(description="Brief overview of the key advisory findings")
    overall_message: str | None = Field(default=None, description="Overall message")
    situation_issue: str | None = Field(default=None, description="Explanation of what is happening grounded in RAG")
    key_findings: List[AdvisoryKeyFinding] | None = Field(default=None, description="Key factual findings")
    potential_impact: AdvisoryImpact | None = Field(default=None, description="Potential impact and risks")
    recommendations: List[AdvisoryRecommendation] = Field(description="Structured recommendations")
    action_items: List[AdvisoryActionItem] = Field(description="Structured action items")
    audience_guidance: List[AdvisoryAudienceGuidance] | None = Field(default=None, description="Guidance for different audiences")
    sources: List[AdvisorySource] | None = Field(default=None, description="Sources and references")
    content_warnings: List[str] | None = Field(default=None, description="Warnings about missing data or uncertainty")

class VisualDataPoint(BaseModel):
    label: str = Field(description="Label for the data point")
    value: str | None = Field(description="Numeric or textual value. Do not invent values.")
    unit: str | None = Field(default=None, description="Unit of measurement (e.g., '%', '$')")

class VisualSpecification(BaseModel):
    visual_type: str = Field(description="e.g. pie_chart, bar_chart, statistics, timeline, process, comparison, illustration, none")
    title: str = Field(description="Title of the visual")
    subtitle: str | None = Field(default=None, description="Subtitle or context")
    data: List[VisualDataPoint] = Field(description="Structured data for rendering. Missing data should be omitted.")
    key_message: str | None = Field(default=None, description="Key message or annotation")
    source_reference: str | None = Field(default=None, description="Source reference")
    aspect_ratio: str = Field(default="16:9", description="e.g. 16:9, 1:1, 4:5")
    style_guidance: str | None = Field(default=None, description="Style guidance or illustration prompt if visual_type is illustration")

class XThreadTweet(BaseModel):
    order: int = Field(description="Sequential tweet number starting from 1")
    text: str = Field(description="Tweet text (max 280 chars), varying length for rhythm")
    suggested_visual: str | None = Field(description="A short description of what image/chart/screenshot would strengthen this specific tweet, only where supported by data. Null if none.")
    visual_specification: VisualSpecification | None = Field(default=None, description="Structured visual specification for accurate rendering. Use 'illustration' for AI image generation, and specific chart types for factual data.")
    generated_image_b64: str | None = Field(default=None, description="Base64 encoded generated image, if available")
    citations: List[Citation] | None = Field(default=None, description="Citations supporting factual claims made in this tweet")

class XThreadOutput(BaseModel):
    hook_tweet: str = Field(description="The opening tweet, written to stop scroll: a strong claim, surprising stat, or question pulled from the source document (max 280 chars).")
    thread_tweets: List[XThreadTweet] = Field(description="List of chronological tweets forming the body of the thread")
    closing_tweet: str = Field(description="Closing tweet with exactly one clear call-to-action (max 280 chars)")
    suggested_hashtags: List[str] = Field(description="Exactly 2-3 relevant hashtags. Do not over-tag.")
    best_posting_window_note: str = Field(description="Short, honest guidance on posting, e.g. 'Threads with data tend to get more engagement when posted on weekdays'")
    citations: List[Citation] = Field(description="Citations supporting the factual claims made in the thread")

class PresentationDataPoint(BaseModel):
    value: str | None = Field(description="The numeric or qualitative value, or null if unavailable")
    label: str = Field(description="Short label")
    availability: str = Field(description="e.g. 'available', 'insufficient_source_data'")

class PresentationDesignRecommendations(BaseModel):
    presentation_style: str = Field(description="e.g. formal, creative, minimalist")
    typography_hierarchy: str
    readability: str
    information_density: str
    visual_consistency: str
    accessibility: str
    professional_considerations: str

class PresentationSource(BaseModel):
    reference: str = Field(description="Name or description of the source")
    url_or_location: str = Field(description="Where this was found in the context")

class Slide(BaseModel):
    slide_number: int = Field(description="Slide number")
    title: str = Field(description="Slide title")
    slide_type: str = Field(description="e.g. title, agenda, executive summary, statistics, comparison, timeline, process, problem, solution, case study, conclusion, call to action")
    layout: str = Field(description="Semantic layout e.g. three_metric_cards, two_column")
    key_takeaway: str = Field(description="Main takeaway of this slide")
    bullet_points: List[str] = Field(description="Key bullet points for the slide")
    data_points: List[PresentationDataPoint] = Field(description="Structured data points for this slide")
    speaker_notes: str = Field(description="Script for the presenter to say while on this slide")
    visual_suggestion: str = Field(description="Idea for an image or chart on this slide")
    source_reference: str = Field(description="Primary source reference for this slide")
    content_warnings: List[str] = Field(description="Warnings about missing data or uncertainty on this slide")
    citations: List[Citation] = Field(description="Citations supporting the facts on this slide")

class PresentationOutput(BaseModel):
    title: str = Field(description="Title of the presentation")
    objective: str = Field(description="Objective of the presentation")
    target_audience: str = Field(description="Intended audience")
    overall_takeaway: str = Field(description="Core takeaway message")
    narrative_structure: str = Field(description="Narrative flow of the presentation")
    design_recommendations: PresentationDesignRecommendations = Field(description="Design guidance")
    sources: List[PresentationSource] = Field(description="Sources and references")
    content_warnings: List[str] = Field(description="Warnings about missing data or uncertainty")
    slides: List[Slide] = Field(description="List of slides in the presentation")

class InfographicDataPoint(BaseModel):
    value: str = Field(description="The numeric or qualitative value (e.g., '40%')")
    label: str = Field(description="Short label (e.g., 'Reduction in time')")
    context_explanation: str = Field(description="Explanation of the data point")
    source_reference: str = Field(description="Source context reference")

class InfographicLayout(BaseModel):
    orientation: str = Field(description="portrait or landscape")
    type: str = Field(description="statistics, cards, timeline, process, comparison")
    structure: str = Field(description="Semantic structural flow")

class InfographicVisualRecommendation(BaseModel):
    visual_type: str = Field(description="e.g. map, bar chart, timeline, icon")
    description: str = Field(description="What the visual should communicate")
    data_availability_note: str = Field(description="Explicit note if data is unavailable or uncertain")

class InfographicMessaging(BaseModel):
    main_message: str = Field(description="Core takeaway message")
    supporting_messages: List[str] = Field(description="Additional supporting messages")
    callouts: List[str] = Field(description="Short callouts suitable for visual presentation")

class InfographicDesignRecommendations(BaseModel):
    typography_hierarchy: str = Field(description="Suggested typography hierarchy")
    readability: str = Field(description="Readability recommendations")
    appropriate_visual_emphasis: str = Field(description="Where visual emphasis should be placed")

class InfographicSource(BaseModel):
    reference: str = Field(description="Name or description of the source")
    url_or_location: str = Field(description="Where this was found in the context")

class InfographicSection(BaseModel):
    section_number: int = Field(description="Sequential section number")
    title: str = Field(description="Title of this section")
    main_message: str = Field(description="Main message for this section")
    key_data_points: List[InfographicDataPoint] = Field(description="Structured data points")
    supporting_explanation: str = Field(description="Supporting explanation")
    visual_metaphor: str = Field(description="Suggestion for icon or visual concept")
    recommended_visual_type: str = Field(description="Suggested visual representation")
    importance: str = Field(description="High, Medium, or Low")
    suggested_position: str = Field(description="e.g., Top Left, Center, Step 2")
    citations: List[Citation] = Field(description="Citations supporting this section")

class InfographicOutput(BaseModel):
    title: str = Field(description="Overall title of the infographic")
    core_takeaway: str = Field(description="Core takeaway message")
    layout: InfographicLayout = Field(description="Layout recommendations")
    messaging: InfographicMessaging = Field(description="Key messaging")
    sections: List[InfographicSection] = Field(description="Sections of the infographic")
    visual_recommendations: List[InfographicVisualRecommendation] = Field(description="Overall visual recommendations")
    design_recommendations: InfographicDesignRecommendations = Field(description="Design guidance")
    sources: List[InfographicSource] = Field(description="Sources and references")
    content_warnings: List[str] = Field(description="Warnings about missing data or uncertainty")
