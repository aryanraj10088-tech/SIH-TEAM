import re

class PromptGuard:
    # A list of common injection attack signatures
    SUSPICIOUS_PATTERNS = [
        r"ignore\s+(all\s+)?previous",
        r"system\s+prompt",
        r"you\s+are\s+now",
        r"disregard\s+instructions",
        r"print\s+prior",
        r"jailbreak"
    ]

    @classmethod
    def is_safe(cls, text: str) -> dict:
        """Scans input text for known prompt injection patterns."""
        text_lower = text.lower()
        for pattern in cls.SUSPICIOUS_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    "safe": False,
                    "flagged_pattern": pattern,
                    "action": "BLOCKED"
                }
        return {"safe": True, "action": "ALLOWED"}
