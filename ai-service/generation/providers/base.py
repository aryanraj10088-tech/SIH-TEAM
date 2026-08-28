from abc import ABC, abstractmethod
from pydantic import BaseModel

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, schema: type[BaseModel]) -> BaseModel:
        """
        Generate structured data based on the provided prompt and schema.
        
        Args:
            prompt (str): The prompt with context and instructions.
            schema (type[BaseModel]): The Pydantic model to validate the output against.
            
        Returns:
            BaseModel: An instance of the provided schema class.
        """
        pass
