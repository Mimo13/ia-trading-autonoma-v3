# IA Trading Autónoma v3

Sistema de trading autónomo con IA que integra Freqtrade, grid bots y un agente conversacional.

## Estructura del Proyecto

```
ia-trading-autonoma-v3/
├── backend/                  # API en Python (FastAPI)
│   ├── src/
│   │   ├── api/             # Endpoints REST
│   │   ├── services/        # Lógica de negocio
│   │   ├── models/          # Modelos de datos
│   │   └── utils/           # Utilidades
│   └── tests/
├── frontend/                 # Dashboard React + React Native
│   ├── src/
│   │   ├── components/      # Componentes UI
│   │   ├── pages/           # Páginas/vistas
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Servicios API
│   │   └── types/           # TypeScript types
│   └── public/
├── database/                 # Migraciones y seeds
│   ├── migrations/
│   └── seeds/
├── scripts/                  # Scripts de utilidad
└── docs/                     # Documentación
```

## Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Supabase (Cloud o local)

## Inicio Rápido

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Python + FastAPI |
| Frontend | React + TypeScript |
| Base de Datos | Supabase (PostgreSQL) |
| Trading | Freqtrade + FreqAI |
| Grid Bots | Binance nativo |
| Agente | Hermes Agent |
