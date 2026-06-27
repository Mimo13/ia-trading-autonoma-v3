from fastapi import APIRouter
from typing import List
from src.models.schemas import Alert, AlertCreate
from src.services.supabase_client import get_supabase_client

router = APIRouter()


@router.get("/", response_model=List[Alert])
async def list_alerts(acknowledged: bool = False, limit: int = 50):
    supabase = get_supabase_client()
    query = supabase.table("alerts").select("*")
    if not acknowledged:
        query = query.eq("acknowledged", False)
    response = query.order("created_at", desc=True).limit(limit).execute()
    return response.data


@router.post("/", response_model=Alert)
async def create_alert(alert: AlertCreate):
    supabase = get_supabase_client()
    response = supabase.table("alerts").insert(alert.model_dump()).execute()
    return response.data[0]


@router.put("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    supabase = get_supabase_client()
    response = supabase.table("alerts").update({"acknowledged": True}).eq("id", alert_id).execute()
    return response.data[0]
