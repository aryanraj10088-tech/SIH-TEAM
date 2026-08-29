from abc import ABC, abstractmethod
from pydantic import BaseModel


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, schema: type[BaseModel]) -> BaseModel:
        """Run a structured LLM call asynchronously."""
        pass
