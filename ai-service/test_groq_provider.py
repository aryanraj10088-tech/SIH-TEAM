import asyncio
from types import SimpleNamespace

import pytest

from generation.providers.groq import GroqProvider


class DummyChatCompletions:
    def __init__(self):
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content='{"headline":"ok"}'))]
        )


def test_provider_uses_groq_key_and_model(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setenv("GROQ_MODEL", "llama-3.1-8b-instant")

    captured = {}

    class DummyGroq:
        def __init__(self, api_key):
            captured["api_key"] = api_key
            self.chat = SimpleNamespace(completions=DummyChatCompletions())

    monkeypatch.setattr("generation.providers.groq.Groq", DummyGroq)

    provider = GroqProvider()
    assert provider.api_key == "test-key"
    assert provider.model == "llama-3.1-8b-instant"

    async def run():
        class ExampleSchema:
            headline: str

        return await provider.generate("prompt", ExampleSchema)

    result = asyncio.run(run())
    assert result["headline"] == "ok"
