from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.api import trades, strategies, signals, alerts, portfolio, freqtrade
from src.config import DEBUG

app = FastAPI(
    title="IA Trading API",
    description="API para el sistema de trading autónomo con IA",
    version="3.0.0",
    debug=DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])
app.include_router(strategies.router, prefix="/api/strategies", tags=["Strategies"])
app.include_router(signals.router, prefix="/api/signals", tags=["Signals"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(freqtrade.router, prefix="/api/freqtrade", tags=["Freqtrade"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc) if DEBUG else "An error occurred"}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.get("/")
async def root():
    return {
        "message": "IA Trading API v3",
        "status": "running",
        "version": "3.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}


@app.get("/api/stats")
async def get_stats():
    from src.services.supabase_client import get_supabase_client
    
    supabase = get_supabase_client()
    
    try:
        strategies_count = supabase.table("strategies").select("id", count="exact").execute()
        trades_count = supabase.table("unified_trades").select("id", count="exact").execute()
        signals_count = supabase.table("ai_signals").select("id", count="exact").execute()
        alerts_count = supabase.table("alerts").select("id", count="exact").eq("acknowledged", False).execute()
        
        return {
            "strategies": strategies_count.count or 0,
            "trades": trades_count.count or 0,
            "signals": signals_count.count or 0,
            "active_alerts": alerts_count.count or 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
