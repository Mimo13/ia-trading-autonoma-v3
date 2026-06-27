# IA Trading Autónoma v3

Sistema de trading autónomo con IA que integra Freqtrade, grid bots y un agente conversacional.

## Características

- 🤖 **Trading Automatizado**: Freqtrade con FreqAI (LightGBM) para predicciones ML
- 📊 **Grid Bots**: Trading en rangos predefinidos en Binance
- 💬 **Agente Conversacional**: Hermes Agent para control por voz/texto
- 📈 **Dashboard Web**: React + TypeScript con Tailwind CSS
- 🔒 **Seguridad**: RLS, credenciales cifradas, confirmación explícita
- ☁️ **Supabase**: PostgreSQL managed con API REST

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Python + FastAPI |
| Frontend | React + TypeScript + Tailwind CSS |
| Base de Datos | Supabase (PostgreSQL) |
| Trading | Freqtrade + FreqAI |
| Grid Bots | Binance nativo |
| Agente | Hermes Agent |

## Estructura del Proyecto

```
ia-trading-autonoma-v3/
├── backend/                  # API Python (FastAPI)
│   ├── src/
│   │   ├── api/            # Endpoints REST
│   │   ├── models/         # Modelos Pydantic
│   │   ├── services/       # Servicios (Supabase client)
│   │   └── config.py       # Configuración
│   └── tests/
├── frontend/                 # Dashboard React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/          # Páginas/vistas
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # Servicios API
│   └── public/
├── database/                 # Migraciones SQL
│   ├── migrations/
│   └── seeds/
├── scripts/                  # Scripts de utilidad
└── docs/                     # Documentación
```

## Inicio Rápido

### 1. Setup Automático

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-role-key
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar Migraciones

```bash
supabase link --project-ref tu-proyecto-ref
supabase db push
```

### 4. Insertar Datos de Ejemplo

```bash
python scripts/seed_data.py
```

### 5. Iniciar Servicios

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn src.api.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

### Estrategias
- `GET /api/strategies/` - Listar estrategias
- `GET /api/strategies/{id}` - Obtener estrategia
- `POST /api/strategies/` - Crear estrategia
- `PUT /api/strategies/{id}` - Actualizar estrategia
- `PATCH /api/strategies/{id}/status` - Cambiar estado
- `DELETE /api/strategies/{id}` - Eliminar estrategia

### Trades
- `GET /api/trades/` - Listar trades
- `GET /api/trades/{id}` - Obtener trade
- `POST /api/trades/` - Crear trade
- `GET /api/trades/stats/profit` - Estadísticas de profit
- `GET /api/trades/stats/pairs` - Estadísticas por par

### Señales IA
- `GET /api/signals/` - Listar señales
- `POST /api/signals/` - Crear señal

### Alertas
- `GET /api/alerts/` - Listar alertas
- `POST /api/alerts/` - Crear alerta
- `PUT /api/alerts/{id}/acknowledge` - Marcar como leída

### Portfolio
- `GET /api/portfolio/snapshots` - Snapshots del balance
- `GET /api/portfolio/balance` - Balance actual

## Roadmap

Ver [roadmap.md](roadmap.md) para el plan completo de desarrollo.

## Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Proyecto privado - Uso personal
