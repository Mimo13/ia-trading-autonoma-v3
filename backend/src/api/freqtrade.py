from fastapi import APIRouter, HTTPException
from typing import Optional
import httpx
from src.config import FREQTRADE_URL, FREQTRADE_USER, FREQTRADE_PASSWORD

router = APIRouter()

# Freqtrade JWT token cache
_freqtrade_token: Optional[str] = None


async def get_freqtrade_token() -> str:
    """Get JWT token from Freqtrade API"""
    global _freqtrade_token
    
    if _freqtrade_token:
        return _freqtrade_token
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{FREQTRADE_URL}/api/v1/token/login",
            json={"username": FREQTRADE_USER, "password": FREQTRADE_PASSWORD}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=503, detail="Freqtrade authentication failed")
        
        data = response.json()
        _freqtrade_token = data.get("access_token")
        return _freqtrade_token


@router.get("/status")
async def get_bot_status():
    """Get Freqtrade bot status"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FREQTRADE_URL}/api/v1/status",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get bot status")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.get("/profit")
async def get_profit():
    """Get profit summary from Freqtrade"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FREQTRADE_URL}/api/v1/profit",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get profit data")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.get("/balance")
async def get_balance():
    """Get balance from Freqtrade"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FREQTRADE_URL}/api/v1/balance",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get balance")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.get("/trades")
async def get_trades(limit: int = 100):
    """Get trades from Freqtrade"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FREQTRADE_URL}/api/v1/trades",
                params={"limit": limit},
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get trades")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.get("/performance")
async def get_performance():
    """Get performance by pair from Freqtrade"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FREQTRADE_URL}/api/v1/performance",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get performance")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.get("/whitelist")
async def get_whitelist():
    """Get whitelist from Freqtrade"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FREQTRADE_URL}/api/v1/whitelist",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get whitelist")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.post("/start")
async def start_bot():
    """Start Freqtrade bot"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{FREQTRADE_URL}/api/v1/start",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to start bot")
            
            return {"message": "Bot started"}
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.post("/stop")
async def stop_bot():
    """Stop Freqtrade bot"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{FREQTRADE_URL}/api/v1/stop",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to stop bot")
            
            return {"message": "Bot stopped"}
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")


@router.post("/reload_config")
async def reload_config():
    """Reload Freqtrade configuration"""
    try:
        token = await get_freqtrade_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{FREQTRADE_URL}/api/v1/reload_config",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to reload config")
            
            return {"message": "Config reloaded"}
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Freqtrade not available")
