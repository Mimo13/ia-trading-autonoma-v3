-- =====================================================================
-- MIGRACIÓN INICIAL: Schema `app` para IA Trading
-- Ejecutar en Supabase SQL Editor
-- =====================================================================

create schema if not exists app;

-- 1. strategies
create table if not exists app.strategies (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    source_type     text not null check (source_type in ('freqtrade', 'grid_bot', 'manual')),
    exchange        text not null default 'binance',
    pair            text,
    status          text not null default 'paused' check (status in ('running', 'paused', 'stopped', 'error')),
    is_paper_trading boolean not null default true,
    config          jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- 2. unified_trades
create table if not exists app.unified_trades (
    id              uuid primary key default gen_random_uuid(),
    strategy_id     uuid not null references app.strategies(id) on delete cascade,
    exchange_trade_id text,
    pair            text not null,
    side            text not null check (side in ('buy', 'sell')),
    amount          numeric not null,
    price           numeric not null,
    fee             numeric default 0,
    profit_abs      numeric,
    profit_pct      numeric,
    opened_at       timestamptz not null,
    closed_at       timestamptz,
    is_paper_trading boolean not null default true,
    raw_payload     jsonb,
    created_at      timestamptz not null default now()
);

create index if not exists idx_unified_trades_strategy on app.unified_trades(strategy_id);
create index if not exists idx_unified_trades_pair on app.unified_trades(pair);
create index if not exists idx_unified_trades_opened_at on app.unified_trades(opened_at desc);

-- 3. ai_signals
create table if not exists app.ai_signals (
    id              uuid primary key default gen_random_uuid(),
    strategy_id     uuid not null references app.strategies(id) on delete cascade,
    pair            text not null,
    signal_type     text not null check (signal_type in ('buy', 'sell', 'hold', 'force_action')),
    confidence      numeric check (confidence >= 0 and confidence <= 1),
    model_name      text,
    features        jsonb,
    reasoning       text,
    executed        boolean not null default false,
    trade_id        uuid references app.unified_trades(id),
    created_at      timestamptz not null default now()
);

create index if not exists idx_ai_signals_strategy on app.ai_signals(strategy_id);
create index if not exists idx_ai_signals_created_at on app.ai_signals(created_at desc);

-- 4. portfolio_snapshots
create table if not exists app.portfolio_snapshots (
    id              uuid primary key default gen_random_uuid(),
    strategy_id     uuid references app.strategies(id) on delete cascade,
    currency        text not null default 'USDT',
    balance_free    numeric not null,
    balance_used    numeric not null default 0,
    balance_total   numeric not null,
    snapshot_at     timestamptz not null default now()
);

create index if not exists idx_snapshots_strategy_time on app.portfolio_snapshots(strategy_id, snapshot_at desc);

-- 5. exchange_credentials
create table if not exists app.exchange_credentials (
    id              uuid primary key default gen_random_uuid(),
    exchange        text not null,
    label           text not null,
    api_key_encrypted text not null,
    api_secret_encrypted text not null,
    created_at      timestamptz not null default now()
);

-- 6. alerts
create table if not exists app.alerts (
    id              uuid primary key default gen_random_uuid(),
    strategy_id     uuid references app.strategies(id) on delete cascade,
    level           text not null check (level in ('info', 'warning', 'critical')),
    message         text not null,
    acknowledged    boolean not null default false,
    created_at      timestamptz not null default now()
);

create index if not exists idx_alerts_unacknowledged on app.alerts(acknowledged) where acknowledged = false;

-- Trigger updated_at
create or replace function app.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_strategies_updated_at on app.strategies;
create trigger trg_strategies_updated_at
    before update on app.strategies
    for each row execute function app.set_updated_at();

-- RLS
alter table app.strategies enable row level security;
alter table app.unified_trades enable row level security;
alter table app.ai_signals enable row level security;
alter table app.portfolio_snapshots enable row level security;
alter table app.alerts enable row level security;

create policy "authenticated_read_strategies" on app.strategies
    for select using (auth.role() = 'authenticated');
create policy "authenticated_read_trades" on app.unified_trades
    for select using (auth.role() = 'authenticated');
create policy "authenticated_read_signals" on app.ai_signals
    for select using (auth.role() = 'authenticated');
create policy "authenticated_read_snapshots" on app.portfolio_snapshots
    for select using (auth.role() = 'authenticated');
create policy "authenticated_read_alerts" on app.alerts
    for select using (auth.role() = 'authenticated');

-- Vista
create or replace view app.v_trades_with_signal as
select
    t.*,
    s.signal_type,
    s.confidence,
    s.model_name,
    s.reasoning
from app.unified_trades t
left join app.ai_signals s on s.trade_id = t.id
order by t.opened_at desc;
