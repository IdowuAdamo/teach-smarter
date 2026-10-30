"""
Provider-Independent LLM Client with Pydantic Structured Output Validation.

Supports:
- OpenAI (gpt-4o-mini, gpt-4o) using native response_format=Model
- Graceful mock fallback for offline testing / sandbox environments.
"""

import json
import logging
from typing import Optional, Type, TypeVar
from pydantic import BaseModel

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    def __init__(
        self,
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.provider = provider or settings.LLM_PROVIDER
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL

        self._client = None
        if self.provider == "openai" and self.api_key and not self.api_key.startswith("sk-mock"):
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI client: {e}")

    def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        response_model: Type[T],
        temperature: float = 0.2,
    ) -> T:
        """
        Generates structured, schema-validated output conforming to response_model.
        """
        if self._client and self.provider == "openai":
            try:
                completion = self._client.beta.chat.completions.parse(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    response_format=response_model,
                    temperature=temperature,
                )
                parsed = completion.choices[0].message.parsed
                if parsed:
                    return parsed
            except Exception as e:
                logger.error(f"OpenAI completion error: {e}. Falling back to schema generation.")

        # If external API is unreachable or mock key, return a validated placeholder
        logger.info(f"Generating validated schema fallback for {response_model.__name__}")
        return self._generate_fallback(response_model)

    def _generate_fallback(self, response_model: Type[T]) -> T:
        """Provides schema-compliant fallback for unit testing and offline sandbox."""
        # Introspect fields to build minimal valid object
        mock_data = {}
        for name, field in response_model.model_fields.items():
            if field.annotation == str:
                mock_data[name] = f"Sample {name.replace('_', ' ')}"
            elif field.annotation == int:
                mock_data[name] = 1
            elif field.annotation == float:
                mock_data[name] = 0.85
            elif field.annotation == bool:
                mock_data[name] = True
            elif getattr(field.annotation, "__origin__", None) == list:
                mock_data[name] = []
            else:
                mock_data[name] = None
        return response_model.model_validate(mock_data)


# Singleton
llm_client = LLMClient()

