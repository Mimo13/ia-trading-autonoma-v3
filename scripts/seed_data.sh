#!/bin/bash
# Script para insertar datos de ejemplo en Supabase usando REST API
# Uso: SUPABASE_SERVICE_KEY=xxx bash scripts/seed_data.sh

set -e

# Load from .env if exists
if [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | xargs)
fi

SUPABASE_URL="${SUPABASE_URL:-https://hqndgumqlfkzmaukptsg.supabase.co}"
API_KEY="${SUPABASE_SERVICE_KEY}"

if [ -z "$API_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_KEY not set"
    echo "Set it in backend/.env or export it"
    exit 1
fi

echo "🌱 Seeding database with sample data..."

# Function to make API calls
supabase_insert() {
    local table=$1
    local data=$2
    curl -s -X POST "$SUPABASE_URL/rest/v1/$table" \
        -H "apikey: $API_KEY" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -H "Accept-Profile: app" \
        -H "Content-Profile: app" \
        -H "Prefer: return=representation" \
        -d "$data"
}

# Insert strategies
echo "📊 Inserting strategies..."
strategies='[
    {"name":"FreqAI Main","source_type":"freqtrade","exchange":"binance","status":"running","is_paper_trading":true,"config":{"stoploss":-0.1,"timeframe":"5m","model":"LightGBM"}},
    {"name":"Grid SOL/USDT","source_type":"grid_bot","exchange":"binance","pair":"SOL/USDT","status":"running","is_paper_trading":true,"config":{"lower_price":100,"upper_price":150,"grid_count":10}},
    {"name":"Grid ETH/USDT","source_type":"grid_bot","exchange":"binance","pair":"ETH/USDT","status":"paused","is_paper_trading":true,"config":{"lower_price":2000,"upper_price":3000,"grid_count":15}}
]'

result=$(supabase_insert "strategies" "$strategies")
echo "✅ Strategies inserted"

# Get strategy IDs
strategy_ids=$(curl -s "$SUPABASE_URL/rest/v1/strategies?select=id" \
    -H "apikey: $API_KEY" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Accept-Profile: app" | python3 -c "import sys,json; ids=json.load(sys.stdin); print(','.join([i['id'] for i in ids]))")

IFS=',' read -ra IDS <<< "$strategy_ids"

# Insert trades
echo "📈 Inserting trades..."
pairs=("BTC/USDT" "ETH/USDT" "SOL/USDT" "DOGE/USDT" "ADA/USDT")
trades="["
for i in {1..30}; do
    sid=${IDS[$RANDOM % ${#IDS[@]}]}
    pair=${pairs[$RANDOM % ${#pairs[@]}]}
    side=$([ $((RANDOM % 2)) -eq 0 ] && echo "buy" || echo "sell")
    price=$(python3 -c "import random; print(round(random.uniform(50, 50000), 2))")
    amount=$(python3 -c "import random; print(round(random.uniform(0.01, 10), 6))")
    profit=$(python3 -c "import random; print(round(random.uniform(-5, 8), 2))")
    
    if [ $i -gt 1 ]; then trades+=","; fi
    trades+="{\"strategy_id\":\"$sid\",\"pair\":\"$pair\",\"side\":\"$side\",\"amount\":$amount,\"price\":$price,\"fee\":$(python3 -c "print(round($price * $amount * 0.001, 2))"),\"profit_abs\":$(python3 -c "print(round($price * $amount * $profit / 100, 2))"),\"profit_pct\":$profit,\"opened_at\":\"$(date -u -v-${i}d +%Y-%m-%dT%H:%M:%SZ)\",\"is_paper_trading\":true}"
done
trades+="]"

result=$(supabase_insert "unified_trades" "$trades")
echo "✅ Trades inserted"

# Insert portfolio snapshots
echo "💰 Inserting portfolio snapshots..."
snapshots="["
for i in {1..30}; do
    balance=$(python3 -c "import random; print(round(10000 + random.uniform(-500, 1500) * $i / 30, 2))")
    if [ $i -gt 1 ]; then snapshots+=","; fi
    snapshots+="{\"currency\":\"USDT\",\"balance_free\":$(python3 -c "print(round($balance * 0.7, 2))"),\"balance_used\":$(python3 -c "print(round($balance * 0.3, 2))"),\"balance_total\":$balance,\"snapshot_at\":\"$(date -u -v-${i}d +%Y-%m-%dT%H:%M:%SZ)\"}"
done
snapshots+="]"

result=$(supabase_insert "portfolio_snapshots" "$snapshots")
echo "✅ Portfolio snapshots inserted"

# Insert alerts
echo "🔔 Inserting alerts..."
alerts="[
    {\"strategy_id\":\"${IDS[0]}\",\"level\":\"warning\",\"message\":\"Drawdown approaching 10% threshold\",\"acknowledged\":false},
    {\"strategy_id\":\"${IDS[1]}\",\"level\":\"info\",\"message\":\"Grid bot SOL/USDT: 5 new orders placed\",\"acknowledged\":true},
    {\"strategy_id\":\"${IDS[0]}\",\"level\":\"critical\",\"message\":\"FreqAI model prediction confidence dropped below 40%\",\"acknowledged\":false}
]"

result=$(supabase_insert "alerts" "$alerts")
echo "✅ Alerts inserted"

echo ""
echo "✨ Seed completed successfully!"
echo ""
echo "Summary:"
echo "  - 3 strategies"
echo "  - 30 trades"
echo "  - 30 portfolio snapshots"
echo "  - 3 alerts"
