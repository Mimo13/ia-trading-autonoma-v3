from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import trades, strategies, signals, alerts, portfolio

app = FastAPI(
    title="IA Trading API",
    description="API para el sistema de trading autónomo con IA",
    version="3.0.0"
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


@app.get("/")
async def root():
    return {"message": "IA Trading API v3", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
