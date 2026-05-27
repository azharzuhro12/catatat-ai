from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gemini_api_key: str = "AIzaSyAogFIXmLExXD27El_hti87YkHJ1HtKtnI"
    groq_api_key: str = "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"
    supabase_url: str = "https://ckioirgckktjqcmsoesy.supabase.co"
    supabase_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraW9pcmdja2t0anFjbXNvZXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MDgxNTEsImV4cCI6MjA5NTE4NDE1MX0.8E0jlsCLDgwA8RYkmsnpkirR-3zSwjtDTh4Km7xj8bY"
    supabase_service_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraW9pcmdja2t0anFjbXNvZXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYwODE1MSwiZXhwIjoyMDk1MTg0MTUxfQ.UPEFfOt09Ob7lzdTu1rlOlpxxVvXSWlJ14MOvbbmfmk"
    openai_api_key: str = ""
    secret_key: str = "dev-secret-key"
    environment: str = "development"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
