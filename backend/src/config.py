import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

FREQTRADE_URL = os.getenv("FREQTRADE_URL", "http://localhost:8080")
FREQTRADE_USER = os.getenv("FREQTRADE_USER", "freqtrader")
FREQTRADE_PASSWORD = os.getenv("FREQTRADE_PASSWORD", "")
