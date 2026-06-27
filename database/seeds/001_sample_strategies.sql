-- Seed data para desarrollo
-- Ejecutar después de la migración inicial

-- Estrategias de ejemplo
INSERT INTO app.strategies (name, source_type, exchange, pair, status, is_paper_trading, config) VALUES
('FreqAI Main', 'freqtrade', 'binance', NULL, 'paused', true, '{"stoploss": -0.1, "timeframe": "5m"}'),
('Grid SOL/USDT', 'grid_bot', 'binance', 'SOL/USDT', 'paused', true, '{"lower_price": 100, "upper_price": 150, "grid_count": 10}'),
('Grid ETH/USDT', 'grid_bot', 'binance', 'ETH/USDT', 'paused', true, '{"lower_price": 2000, "upper_price": 3000, "grid_count": 15}');
