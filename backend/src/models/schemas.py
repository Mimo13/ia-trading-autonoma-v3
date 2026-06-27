from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class StrategyBase(BaseModel):
    name: str
    source_type: str  # 'freqtrade', 'grid_bot', 'manual'
    exchange: str = "binance"
    pair: Optional[str] = None
    status: str = "paused"
    is_paper_trading: bool = True
    config: Optional[dict] = None


class StrategyCreate(StrategyBase):
    pass


class Strategy(StrategyBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TradeBase(BaseModel):
    strategy_id: UUID
    exchange_trade_id: Optional[str] = None
    pair: str
    side: str  # 'buy', 'sell'
    amount: float
    price: float
    fee: float = 0
    profit_abs: Optional[float] = None
    profit_pct: Optional[float] = None
    opened_at: datetime
    closed_at: Optional[datetime] = None
    is_paper_trading: bool = True
    raw_payload: Optional[dict] = None


class TradeCreate(TradeBase):
    pass


class Trade(TradeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SignalBase(BaseModel):
    strategy_id: UUID
    pair: str
    signal_type: str  # 'buy', 'sell', 'hold', 'force_action'
    confidence: Optional[float] = None
    model_name: Optional[str] = None
    features: Optional[dict] = None
    reasoning: Optional[str] = None
    executed: bool = False
    trade_id: Optional[UUID] = None


class SignalCreate(SignalBase):
    pass


class Signal(SignalBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class AlertBase(BaseModel):
    strategy_id: Optional[UUID] = None
    level: str  # 'info', 'warning', 'critical'
    message: str
    acknowledged: bool = False


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioSnapshotBase(BaseModel):
    strategy_id: Optional[UUID] = None
    currency: str = "USDT"
    balance_free: float
    balance_used: float = 0
    balance_total: float
    snapshot_at: Optional[datetime] = None


class PortfolioSnapshot(PortfolioSnapshotBase):
    id: UUID

    class Config:
        from_attributes = True
