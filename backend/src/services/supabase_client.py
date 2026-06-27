from supabase import create_client, Client
from src.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase_admin() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
