from fastapi import APIRouter
from typing import List
from src.models.schemas import Signal, SignalCreate
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/", response_model=List[Signal])
async def list_signals(strategy_id: str = None, pair: str = None, limit: int = 50):
    supabase = get_supabase_client()
    query = supabase.table("ai_signals").select("*")
    if strategy_id:
        query = query.eq("strategy_id", strategy_id)
    if pair:
        query = query.eq("pair", pair)
    response = query.order("created_at", desc=True).limit(limit).execute()
    return response.data


@router.post("/", response_model=Signal)
async def create_signal(signal: SignalCreate):
    supabase = get_supabase_client()
    response = supabase.table("ai_signals").insert(signal.model_dump()).execute()
    return response.data[0]
