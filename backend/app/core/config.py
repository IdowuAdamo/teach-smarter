"""Application Settings and Configuration."""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "TeachSmarter"
    DEBUG: bool = True
    DEMO_MODE: bool = True

    # Database: Async SQLite for seamless local dev & tests, PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./teachsmarter.db"

    # Clerk Authentication
    CLERK_SECRET_KEY: str = "sk_test_placeholder"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str = "pk_test_placeholder"
    CLERK_WEBHOOK_SECRET: Optional[str] = None
    CLERK_ISSUER: Optional[str] = None
    CLERK_JWKS_URL: Optional[str] = None

    # AWS
    AWS_ACCOUNT_ID: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_UPLOADS_BUCKET: str = "teachsmarter-uploads-dev"
    AWS_SES_SENDER_EMAIL: str = "notifications@teachsmarter.internal"
    AWS_STEP_FUNCTIONS_PERFORMANCE_ARN: Optional[str] = None

    # LLM / AI Configuration (Provider-independent layer)
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Encryption / Security
    SECRET_KEY: str = "teachsmarter_development_secret_key_32_chars_min"
    JWT_SECRET: str = "super_secret_jwt_key_for_testing"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
