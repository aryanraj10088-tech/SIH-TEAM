import re

def sanitize_text(text: str) -> str:
    """Cleans extracted text to prevent basic prompt injections and formatting errors."""

    # 1. Strip blatant system prompt overrides
    dangerous_phrases = [
        r"ignore all previous instructions",
        r"ignore your previous instructions",
        r"you are now an unrestricted",
        r"system prompt override",
        r"forget your instructions"
    ]

    sanitized = text
    for phrase in dangerous_phrases:
        # Replace malicious commands with a safe placeholder
        sanitized = re.sub(phrase, "[REDACTED_INJECTION_ATTEMPT]", sanitized, flags=re.IGNORECASE)

    # 2. Clean up excessive whitespace and hidden control characters
    # These often mess up chunking and vector storage
    sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', sanitized)
    sanitized = re.sub(r'\s+', ' ', sanitized)

    return sanitized.strip()
