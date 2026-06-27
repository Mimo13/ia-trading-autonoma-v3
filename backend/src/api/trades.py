from fastapi import APIRouter, HTTPException
from typing import List
from src.models.schemas import Trade, TradeCreate
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/", response_model=List[Trade])
async def list_trades(strategy_id: str = None, pair: str = None, limit: int = 100):
    supabase = get_supabase_client()
    query = supabase.table("unified_trades").select("*")
    if strategy_id:
        query = query.eq("strategy_id", strategy_id)
    if pair:
        query = query.eq("pair", pair)
    response = query.order("opened_at", desc=True).limit(limit).execute()
    return response.data


@router.get("/{trade_id}", response_model=Trade)
async def get_trade(trade_id: str):
    supabase = get_supabase_client()
    response = supabase.table("unified_trades").select("*").eq("id", trade_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Trade not found")
    return response.data[0]


@router.post("/", response_model=Trade)
async def create_trade(trade: TradeCreate):
    supabase = get_supabase_client()
    response = supabase.table("unified_trades").insert(trade.model_dump()).execute()
    return response.data[0]


@router.get("/stats/profit")
async def get_profit_stats(strategy_id: str = None):
    supabase = get_supabase_client()
    query = supabase.table("unified_trades").select("profit_abs, profit_pct")
    if strategy_id:
        query = query.eq("strategy_id", strategy_id)
    response = query.execute()
    trades = response.data
    total_profit = sum(t.get("profit_abs", 0) or 0 for t in trades)
    avg_pct = sum(t.get("profit_pct", 0) or 0 for t in trades) / len(trades) if trades else 0
    return {
        "total_trades": len(trades),
        "total_profit_abs": total_profit,
        "avg_profit_pct": avg_pct
    }
