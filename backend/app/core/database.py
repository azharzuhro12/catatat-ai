from supabase import create_client, Client
from app.core.config import get_settings
from functools import lru_cache


@lru_cache()
def get_supabase() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)


@lru_cache()
def get_supabase_admin() -> Client:
    """Client dengan service_role key — bypass RLS. Hati-hati penggunaannya."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)
