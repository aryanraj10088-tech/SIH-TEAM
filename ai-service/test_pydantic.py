import json
from generation.schemas import ExecutiveSummaryOutput

raw_json = '''{
    "headline": "AI Drives Automation and Vision Across Industries",
    "key_points": [
        "AI is transforming industries",
        "Machine learning enables automation and deep learning powers vision systems"
    ],
    "action_items": [
        "Invest in AI-driven automation and vision solutions to stay competitive"
    ],
    "citations": [
        {
            "chunk_id": "1",
            "supporting_text": "AI is transforming industries."
        }
    ]
}'''

result = ExecutiveSummaryOutput.model_validate_json(raw_json)
print("? Validation successful!")
print(f"Headline: {result.headline}")
print(f"Key Points: {len(result.key_points)} items")
print(f"Action Items: {len(result.action_items)} items")
print(f"Citations: {len(result.citations)} items")
