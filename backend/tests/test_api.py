import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


class TestHealthEndpoints:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert data["version"] == "3.0.0"

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_docs(self):
        response = client.get("/docs")
        assert response.status_code == 200

    def test_stats(self):
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "strategies" in data
        assert "trades" in data
        assert "signals" in data
        assert "active_alerts" in data


class TestStrategiesEndpoints:
    def test_list_strategies(self):
        response = client.get("/api/strategies/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_strategies_with_filters(self):
        response = client.get("/api/strategies/?status=running")
        assert response.status_code == 200
        
        response = client.get("/api/strategies/?source_type=freqtrade")
        assert response.status_code == 200

    def test_get_strategy_not_found(self):
        response = client.get("/api/strategies/nonexistent-id")
        assert response.status_code == 404


class TestTradesEndpoints:
    def test_list_trades(self):
        response = client.get("/api/trades/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_trades_with_filters(self):
        response = client.get("/api/trades/?side=buy")
        assert response.status_code == 200
        
        response = client.get("/api/trades/?status=closed")
        assert response.status_code == 200

    def test_trades_stats(self):
        response = client.get("/api/trades/stats/profit")
        assert response.status_code == 200
        data = response.json()
        assert "total_trades" in data
        assert "win_rate" in data
        assert "total_profit_abs" in data

    def test_trades_pair_stats(self):
        response = client.get("/api/trades/stats/pairs")
        assert response.status_code == 200


class TestSignalsEndpoints:
    def test_list_signals(self):
        response = client.get("/api/signals/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_signals_with_filters(self):
        response = client.get("/api/signals/?pair=BTC/USDT")
        assert response.status_code == 200


class TestAlertsEndpoints:
    def test_list_alerts(self):
        response = client.get("/api/alerts/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_alerts_unread(self):
        response = client.get("/api/alerts/?acknowledged=false")
        assert response.status_code == 200


class TestPortfolioEndpoints:
    def test_list_snapshots(self):
        response = client.get("/api/portfolio/snapshots")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_balance(self):
        response = client.get("/api/portfolio/balance")
        assert response.status_code == 200
        data = response.json()
        assert "balance_free" in data
        assert "balance_used" in data
        assert "balance_total" in data


class TestFreqtradeEndpoints:
    def test_freqtrade_status_unavailable(self):
        """Test that Freqtrade endpoints return 503 when Freqtrade is not running"""
        response = client.get("/api/freqtrade/status")
        assert response.status_code == 503
        assert "not available" in response.json()["detail"].lower()
