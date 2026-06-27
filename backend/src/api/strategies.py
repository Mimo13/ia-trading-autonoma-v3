from fastapi import APIRouter, HTTPException
from typing import List
from src.models.schemas import Strategy, StrategyCreate
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/", response_model=List[Strategy])
async def list_strategies():
    supabase = get_supabase_client()
    response = supabase.table("strategies").select("*").execute()
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


@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: str):
    supabase = get_supabase_client()
    supabase.table("strategies").delete().eq("id", strategy_id).execute()
    return {"message": "Strategy deleted"}
