#!/usr/bin/env python3
"""
Script para insertar datos de ejemplo en Supabase
Uso: python scripts/seed_data.py
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'venv', 'lib', 'python3.9', 'site-packages'))

from supabase import create_client

# Supabase config - load from environment or .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hqndgumqlfkzmaukptsg.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def get_supabase_admin():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_strategies(supabase):
    """Insertar estrategias de ejemplo"""
    strategies = [
        {
            "name": "FreqAI Main",
            "source_type": "freqtrade",
            "exchange": "binance",
            "status": "running",
            "is_paper_trading": True,
            "config": {
                "stoploss": -0.1,
                "timeframe": "5m",
                "model": "LightGBM",
                "features": ["rsi", "macd", "bb"]
            }
        },
        {
            "name": "Grid SOL/USDT",
            "source_type": "grid_bot",
            "exchange": "binance",
            "pair": "SOL/USDT",
            "status": "running",
            "is_paper_trading": True,
            "config": {
                "lower_price": 100,
                "upper_price": 150,
                "grid_count": 10,
                "invest_per_grid": 100
            }
        },
        {
            "name": "Grid ETH/USDT",
            "source_type": "grid_bot",
            "exchange": "binance",
            "pair": "ETH/USDT",
            "status": "paused",
            "is_paper_trading": True,
            "config": {
                "lower_price": 2000,
                "upper_price": 3000,
                "grid_count": 15,
                "invest_per_grid": 200
            }
        }
    ]
    
    result = supabase.table("strategies").upsert(strategies).execute()
    print(f"Inserted {len(result.data)} strategies")
    return result.data


def seed_trades(supabase, strategies):
    """Insertar trades de ejemplo"""
    pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "DOGE/USDT", "ADA/USDT"]
    trades = []
    
    for i in range(50):
        strategy = random.choice(strategies)
        pair = strategy.get("pair") or random.choice(pairs)
        side = random.choice(["buy", "sell"])
        price = random.uniform(50, 50000)
        amount = random.uniform(0.01, 10)
        profit_pct = random.uniform(-5, 8)
        profit_abs = price * amount * profit_pct / 100
        
        opened_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
        closed_at = opened_at + timedelta(hours=random.randint(1, 48)) if random.random() > 0.3 else None
        
        trades.append({
            "strategy_id": strategy["id"],
            "pair": pair,
            "side": side,
            "amount": round(amount, 6),
            "price": round(price, 2),
            "fee": round(price * amount * 0.001, 2),
            "profit_abs": round(profit_abs, 2) if closed_at else None,
            "profit_pct": round(profit_pct, 2) if closed_at else None,
            "opened_at": opened_at.isoformat(),
            "closed_at": closed_at.isoformat() if closed_at else None,
            "is_paper_trading": True
        })
    
    result = supabase.table("unified_trades").insert(trades).execute()
    print(f"Inserted {len(result.data)} trades")
    return result.data


def seed_signals(supabase, strategies, trades):
    """Insertar señales de ejemplo"""
    signals = []
    models = ["freqai_lightgbm_v1", "freqai_lightgbm_v2", "freqai_xgboost_v1"]
    
    for trade in trades[:20]:
        strategy = next((s for s in strategies if s["id"] == trade["strategy_id"]), strategies[0])
        confidence = random.uniform(0.3, 0.95)
        
        signals.append({
            "strategy_id": strategy["id"],
            "pair": trade["pair"],
            "signal_type": trade["side"],
            "confidence": round(confidence, 3),
            "model_name": random.choice(models),
            "features": {
                "rsi": round(random.uniform(20, 80), 2),
                "macd": round(random.uniform(-100, 100), 2),
                "volume_ratio": round(random.uniform(0.5, 2.0), 2)
            },
            "reasoning": f"Signal generated based on technical analysis. RSI indicates {'oversold' if trade['side'] == 'buy' else 'overbought'} conditions.",
            "executed": True,
            "trade_id": trade["id"],
            "created_at": trade["opened_at"]
        })
    
    result = supabase.table("ai_signals").insert(signals).execute()
    print(f"Inserted {len(result.data)} signals")
    return result.data


def seed_alerts(supabase, strategies):
    """Insertar alertas de ejemplo"""
    alerts = [
        {
            "strategy_id": strategies[0]["id"],
            "level": "warning",
            "message": "Drawdown approaching 10% threshold",
            "acknowledged": False
        },
        {
            "strategy_id": strategies[1]["id"],
            "level": "info",
            "message": "Grid bot SOL/USDT: 5 new orders placed",
            "acknowledged": True
        },
        {
            "strategy_id": strategies[0]["id"],
            "level": "critical",
            "message": "FreqAI model prediction confidence dropped below 40%",
            "acknowledged": False
        }
    ]
    
    result = supabase.table("alerts").insert(alerts).execute()
    print(f"Inserted {len(result.data)} alerts")
    return result.data


def seed_portfolio(supabase, strategies):
    """Insertar snapshots de portfolio"""
    snapshots = []
    
    for i in range(30):
        days_ago = 30 - i
        snapshot_at = datetime.utcnow() - timedelta(days=days_ago)
        balance = 10000 + random.uniform(-500, 1500) * i / 30
        
        snapshots.append({
            "currency": "USDT",
            "balance_free": round(balance * 0.7, 2),
            "balance_used": round(balance * 0.3, 2),
            "balance_total": round(balance, 2),
            "snapshot_at": snapshot_at.isoformat()
        })
    
    result = supabase.table("portfolio_snapshots").insert(snapshots).execute()
    print(f"Inserted {len(result.data)} portfolio snapshots")
    return result.data


def main():
    print("Seeding database with sample data...")
    
    supabase = get_supabase_admin()
    
    strategies = seed_strategies(supabase)
    trades = seed_trades(supabase, strategies)
    seed_signals(supabase, strategies, trades)
    seed_alerts(supabase, strategies)
    seed_portfolio(supabase, strategies)
    
    print("\nSeed completed successfully!")


if __name__ == "__main__":
    main()
