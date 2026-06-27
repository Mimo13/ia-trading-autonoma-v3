import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert data["version"] == "3.0.0"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_docs():
    response = client.get("/docs")
    assert response.status_code == 200


def test_strategies_endpoint():
    response = client.get("/api/strategies/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_trades_endpoint():
    response = client.get("/api/trades/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_signals_endpoint():
    response = client.get("/api/signals/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_alerts_endpoint():
    response = client.get("/api/alerts/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_portfolio_endpoint():
    response = client.get("/api/portfolio/snapshots")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_trades_stats():
    response = client.get("/api/trades/stats/profit")
    assert response.status_code == 200
    data = response.json()
    assert "total_trades" in data
    assert "win_rate" in data
