from fastapi import APIRouter
from typing import List
from src.models.schemas import PortfolioSnapshot
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/snapshots", response_model=List[PortfolioSnapshot])
async def list_snapshots(strategy_id: str = None, limit: int = 30):
    supabase = get_supabase_client()
    query = supabase.table("portfolio_snapshots").select("*")
    if strategy_id:
        query = query.eq("strategy_id", strategy_id)
    response = query.order("snapshot_at", desc=True).limit(limit).execute()
    return response.data


@router.get("/balance")
async def get_current_balance():
    supabase = get_supabase_client()
    response = supabase.table("portfolio_snapshots").select("*").order("snapshot_at", desc=True).limit(1).execute()
    if not response.data:
        return {"balance_free": 0, "balance_used": 0, "balance_total": 0}
    return response.data[0]
