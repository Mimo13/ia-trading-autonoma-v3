from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from src.models.schemas import Trade, TradeCreate
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/", response_model=List[Trade])
async def list_trades(
    strategy_id: Optional[str] = None,
    pair: Optional[str] = None,
    side: Optional[str] = None,
    status: Optional[str] = None,
    days: Optional[int] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0
):
    supabase = get_supabase_client()
    query = supabase.table("unified_trades").select("*")
    
    if strategy_id:
        query = query.eq("strategy_id", strategy_id)
    if pair:
        query = query.eq("pair", pair)
    if side:
        query = query.eq("side", side)
    if status == "open":
        query = query.is_("closed_at", "null")
    elif status == "closed":
        query = query.not_.is_("closed_at", "null")
    if days:
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("opened_at", since)
    
    response = query.order("opened_at", desc=True).range(offset, offset + limit - 1).execute()
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
async def get_profit_stats(
    strategy_id: Optional[str] = None,
    days: Optional[int] = 30
):
    supabase = get_supabase_client()
    query = supabase.table("unified_trades").select("profit_abs, profit_pct, side")
    
    if strategy_id:
        query = query.eq("strategy_id", strategy_id)
    if days:
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("opened_at", since)
    
    response = query.execute()
    trades = response.data
    
    if not trades:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_profit_abs": 0,
            "avg_profit_pct": 0,
            "best_trade": None,
            "worst_trade": None
        }
    
    total_profit = sum(t.get("profit_abs", 0) or 0 for t in trades)
    winning_trades = [t for t in trades if (t.get("profit_abs") or 0) > 0]
    losing_trades = [t for t in trades if (t.get("profit_abs") or 0) < 0]
    
    profits = [t.get("profit_pct", 0) or 0 for t in trades]
    avg_pct = sum(profits) / len(profits) if profits else 0
    
    best_trade = max(trades, key=lambda t: t.get("profit_abs", 0) or 0) if trades else None
    worst_trade = min(trades, key=lambda t: t.get("profit_abs", 0) or 0) if trades else None
    
    return {
        "total_trades": len(trades),
        "winning_trades": len(winning_trades),
        "losing_trades": len(losing_trades),
        "win_rate": len(winning_trades) / len(trades) * 100 if trades else 0,
        "total_profit_abs": total_profit,
        "avg_profit_pct": avg_pct,
        "best_trade": {
            "pair": best_trade.get("pair") if best_trade else None,
            "profit": best_trade.get("profit_abs") if best_trade else None
        },
        "worst_trade": {
            "pair": worst_trade.get("pair") if worst_trade else None,
            "profit": worst_trade.get("profit_abs") if worst_trade else None
        }
    }


@router.get("/stats/pairs")
async def get_pair_stats():
    supabase = get_supabase_client()
    response = supabase.table("unified_trades").select("pair, profit_abs, profit_pct").execute()
    trades = response.data
    
    pair_stats = {}
    for trade in trades:
        pair = trade.get("pair")
        if pair not in pair_stats:
            pair_stats[pair] = {"count": 0, "total_profit": 0, "avg_profit": 0}
        pair_stats[pair]["count"] += 1
        pair_stats[pair]["total_profit"] += trade.get("profit_abs", 0) or 0
    
    for pair in pair_stats:
        if pair_stats[pair]["count"] > 0:
            pair_stats[pair]["avg_profit"] = pair_stats[pair]["total_profit"] / pair_stats[pair]["count"]
    
    return pair_stats
