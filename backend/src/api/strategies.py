from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from src.models.schemas import Strategy, StrategyCreate
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/", response_model=List[Strategy])
async def list_strategies(
    status: Optional[str] = None,
    source_type: Optional[str] = None,
    exchange: Optional[str] = None
):
    supabase = get_supabase_client()
    query = supabase.table("strategies").select("*")
    
    if status:
        query = query.eq("status", status)
    if source_type:
        query = query.eq("source_type", source_type)
    if exchange:
        query = query.eq("exchange", exchange)
    
    response = query.order("created_at", desc=True).execute()
    return response.data


@router.get("/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: str):
    supabase = get_supabase_client()
    response = supabase.table("strategies").select("*").eq("id", strategy_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return response.data[0]


@router.post("/", response_model=Strategy)
async def create_strategy(strategy: StrategyCreate):
    supabase = get_supabase_client()
    response = supabase.table("strategies").insert(strategy.model_dump()).execute()
    return response.data[0]


@router.put("/{strategy_id}", response_model=Strategy)
async def update_strategy(strategy_id: str, strategy: StrategyCreate):
    supabase = get_supabase_client()
    response = supabase.table("strategies").update(strategy.model_dump()).eq("id", strategy_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return response.data[0]


@router.patch("/{strategy_id}/status")
async def update_strategy_status(strategy_id: str, status: str):
    if status not in ["running", "paused", "stopped", "error"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    supabase = get_supabase_client()
    response = supabase.table("strategies").update({"status": status}).eq("id", strategy_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return {"message": f"Strategy status updated to {status}"}


@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: str):
    supabase = get_supabase_client()
    supabase.table("strategies").delete().eq("id", strategy_id).execute()
    return {"message": "Strategy deleted"}
