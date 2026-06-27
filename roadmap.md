# ROADMAP — IA Trading Autónoma v3

## Análisis del Proyecto

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                         │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ React Web    │  │ React Native │                            │
│  │ (Dashboard)  │  │ (Móvil)      │                            │
│  └──────┬───────┘  └──────┬───────┘                            │
│         └─────────────────┼──────────────────────────────────┐ │
│                           ▼                                  │ │
│                    ┌──────────────┐                           │ │
│                    │   Supabase   │                           │ │
│                    │   (API + DB) │                           │ │
│                    └──────────────┘                           │ │
└──────────────────────────────────────────────────────────────┘ │
                           │                                      │
                           ▼                                      │
┌──────────────────────────────────────────────────────────────┐ │
│                    CAPA DE SERVICIOS                          │ │
│  ┌──────────────────────────────────────────────────────┐    │ │
│  │               Hermes Agent (Conversacional)          │    │ │
│  │  ┌────────────────────────────────────────────────┐  │    │ │
│  │  │           freqtrade-control (Skill)            │  │    │ │
│  │  │  - Monitoreo (status, profit, balance)         │  │    │ │
│  │  │  - Control (forceentry, forceexit, stopbuy)    │  │    │ │
│  │  │  - WebSocket (eventos en tiempo real)          │  │    │ │
│  │  └────────────────────────────────────────────────┘  │    │ │
│  └──────────────────────────────────────────────────────┘    │ │
└──────────────────────────────────────────────────────────────┘ │
                           │                                      │
                           ▼                                      │
┌──────────────────────────────────────────────────────────────┐ │
│                    CAPA DE EJECUCIÓN                          │ │
│  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │   Freqtrade      │  │   Grid Bots      │                   │ │
│  │   (FreqAI/ML)    │  │   (Binance)      │                   │ │
│  │   - LightGBM     │  │   - SOL/USDT     │                   │ │
│  │   - Multi-pair   │  │   - Otros pares  │                   │ │
│  └──────────────────┘  └──────────────────┘                   │ │
│           │                     │                             │ │
│           └─────────┬───────────┘                             │ │
│                     ▼                                         │ │
│           ┌──────────────────┐                                │ │
│           │     Binance      │                                │ │
│           │    (Exchange)    │                                │ │
│           └──────────────────┘                                │ │
└──────────────────────────────────────────────────────────────┘ │
                                                                  │
                    ┌─────────────────────────────────────────────┘
                    ▼
          ┌──────────────────┐
          │   PostgreSQL     │
          │   (Supabase DB)  │
          │   Schema: app    │
          │   - strategies   │
          │   - unified_trades│
          │   - ai_signals   │
          │   - portfolio_snapshots│
          │   - alerts       │
          │   - exchange_credentials│
          └──────────────────┘
```

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Motor Trading** | Freqtrade + FreqAI | Ejecución automatizada de estrategias |
| **ML Model** | LightGBM (FreqAI) | Predicción de señales buy/sell/hold |
| **Grid Bots** | Binance nativo | Trading en rangos predefinidos |
| **Agente IA** | Hermes Agent | Interfaz conversacional |
| **Backend DB** | Supabase (PostgreSQL) | Persistencia y API |
| **Frontend Web** | React | Dashboard de monitoreo |
| **Frontend Móvil** | React Native | App móvil |
| **Infraestructura** | Mac mini M4 (16GB) | Servidor local |
| **Red** | Tailscale | Acceso seguro remoto |

### Base de Datos (Schema `app`)

| Tabla | Descripción |
|-------|-------------|
| `strategies` | Catálogo de estrategias (freqtrade, grid_bot, manual) |
| `unified_trades` | Operaciones unificadas de cualquier origen |
| `ai_signals` | Señales de IA con justificación (anti-caja negra) |
| `portfolio_snapshots` | Snapshots periódicos del balance |
| `alerts` | Eventos y notificaciones |
| `exchange_credentials` | Claves API cifradas (solo backend) |

### Endpoints Freqtrade

**Monitorización (Solo Lectura):**
- `/api/v1/ping` — Health check
- `/api/v1/status` — Operaciones abiertas
- `/api/v1/profit` — Resumen de beneficios
- `/api/v1/performance` — Rendimiento por par
- `/api/v1/balance` — Balance actual
- `/api/v1/daily` — P&L diario
- `/api/v1/trades` — Histórico de trades
- `/api/v1/whitelist` / `/blacklist` — Pares habilitados/excluidos
- `/api/v1/strategies` — Estrategias disponibles
- `/api/v1/logs` — Logs del bot
- `/api/v1/sysinfo` — CPU/RAM

**Control (Requiere Confirmación):**
- `/api/v1/forceentry` — Forzar entrada
- `/api/v1/forceexit` — Forzar salida
- `/api/v1/stopbuy` — Bloquear nuevas entradas
- `/api/v1/start` / `/stop` — Iniciar/detener bot
- `/api/v1/reload_config` — Recargar configuración

**Tiempo Real (Fase Posterior):**
- `/api/v1/message/ws` — WebSocket para eventos

---

## ROADMAP DE TAREAS

### FASE 0: Fundación (Prioridad: ALTA)

- [x] **T0.1** — Inicializar repositorio Git ✅
- [x] **T0.2** — Crear `.gitignore` ✅
- [x] **T0.3** — Configurar entorno Python (venv) ✅
- [x] **T0.4** — Configurar entorno Node.js para frontend ✅
- [x] **T0.5** — Documentar requisitos previos en `README.md` ✅
- [ ] **T0.6** — Crear `docker-compose.yml` para Freqtrade

### FASE 1: Backend y Base de Datos (Prioridad: ALTA)

- [x] **T1.1** — Estructura de proyecto creada ✅
- [x] **T1.2** — Backend Python + FastAPI base ✅
- [x] **T1.3** — Migración del schema `app` (database/migrations/001_init_schema.sql) ✅
- [x] **T1.4** — Seed data de estrategias (database/seeds/001_sample_strategies.sql) ✅
- [x] **T1.5** — Cliente Supabase para Python (backend/src/services/supabase_client.py) ✅
- [x] **T1.6** — Cliente Supabase para TypeScript (frontend/src/services/supabase.ts) ✅
- [x] **T1.7** — Modelos de datos Pydantic (backend/src/models/schemas.py) ✅
- [x] **T1.8** — API endpoints CRUD (strategies, trades, signals, alerts, portfolio) ✅
- [x] **T1.9** — Migración ejecutada en Supabase Cloud ✅
- [x] **T1.10** — Schema `app` expuesto a PostgREST ✅
- [x] **T1.11** — Permisos concedidos a roles anon/authenticated/service_role ✅
- [x] **T1.12** — Datos de ejemplo insertados (3 estrategias) ✅
- [ ] **T1.13** — Implementar servicio de cifrado para exchange_credentials

### FASE 2: Freqtrade Core (Prioridad: ALTA)

- [x] **T2.1** — Docker Compose para Freqtrade ✅
- [x] **T2.2** — Crear `config.json` base (dry-run, API server, pares) ✅
- [x] **T2.3** — Implementar estrategia base (RSI + MACD + Bollinger) ✅
- [x] **T2.4** — Estructura de user_data creada ✅
- [x] **T2.5** — Iniciar Freqtrade con Docker Compose ✅
- [x] **T2.6** — API respondiendo en localhost:8080 ✅
- [x] **T2.7** — Configurar Binance testnet ✅
- [x] **T2.8** — Configurar Telegram ✅
- [x] **T2.9** — Descargar datos históricos (30 días, 4 pares) ✅
- [x] **T2.10** — Crear estrategia FreqAI LightGBM ✅
- [x] **T2.11** — Ejecutar backtest (317 trades, 53.3% win rate) ✅
- [x] **T2.12** — Enviar resultados a Telegram ✅
- [ ] **T2.13** — Entrenar modelo FreqAI con datos históricos
- [ ] **T2.14** — Optimizar parámetros de estrategia

### FASE 3: Skill Hermes `freqtrade-control` (Prioridad: ALTA)

- [x] **T3.1** — API endpoints para Freqtrade (backend/src/api/freqtrade.py) ✅
- [x] **T3.2** — Autenticación JWT contra Freqtrade ✅
- [x] **T3.3** — Endpoints de monitorización (status, profit, balance, performance) ✅
- [x] **T3.4** — Endpoints de control (start, stop, reload_config) ✅
- [x] **T3.5** — Manejo de errores y resiliencia (Freqtrade offline) ✅
- [x] **T3.6** — Skill Hermes creada (~/.hermes/skills/trading/freqtrade-control/) ✅
- [x] **T3.7** — SKILL.md con documentación completa ✅
- [x] **T3.8** — handler.py con todas las funciones ✅
- [x] **T3.9** — config.yaml de configuración ✅
- [x] **T3.10** — Logging de acciones en Supabase ✅
- [ ] **T3.11** — Tests unitarios de la skill
- [ ] **T3.12** — Prueba end-to-end con Freqtrade

### FASE 4: Integración de Datos (Prioridad: MEDIA)

- [ ] **T4.1** — Implementar webhook/sync para unificar trades de Freqtrade → `app.unified_trades`
- [ ] **T4.2** — Implementar sync de grid bots existentes → `app.unified_trades`
- [ ] **T4.3** — Implementar captura de señales FreqAI → `app.ai_signals`
- [ ] **T4.4** — Implementar snapshots periódicos del portfolio
- [ ] **T4.5** — Implementar sistema de alertas → `app.alerts`
- [ ] **T4.6** — Crear vista `v_trades_with_signal` y consultas optimizadas

### FASE 5: Dashboard Web (Prioridad: MEDIA)

- [x] **T5.1** — Inicializar proyecto React (Vite + TypeScript) ✅
- [x] **T5.2** — Configurar Supabase client y autenticación ✅
- [x] **T5.3** — Crear layout base (sidebar, header, routing) ✅
- [x] **T5.4** — Implementar vista de Portfolio (balance, evolución) ✅
- [x] **T5.5** — Implementar vista de Trades (tabla, filtros, detalle) ✅
- [x] **T5.6** — Implementar vista de Señales IA (con justificación) ✅
- [x] **T5.7** — Implementar vista de Estrategias (estado, config) ✅
- [x] **T5.8** — Implementar sistema de alertas en tiempo real ✅
- [x] **T5.9** — Componentes UI reutilizables (Card, Badge, Button, Table) ✅
- [x] **T5.10** — Implementar gráficos de rendimiento (Recharts) ✅
- [x] **T5.11** — Vista de Portfolio detallada con gráficos ✅
- [x] **T5.12** — Vista de Configuración/Settings ✅
- [x] **T5.13** — Diseño responsive para móvil ✅
- [x] **T5.14** — Sistema de notificaciones con polling ✅
- [x] **T5.15** — Hook WebSocket para tiempo real ✅

### FASE 6: App Móvil (Prioridad: BAJA)

- [ ] **T6.1** — Inicializar proyecto React Native (Expo)
- [ ] **T6.2** — Compartir lógica de negocio con web (monorepo o lib compartida)
- [ ] **T6.3** — Implementar pantallas principales (Portfolio, Trades, Alertas)
- [ ] **T6.4** — Implementar notificaciones push
- [ ] **T6.5** — Publicar en TestFlight / Google Play Beta

### FASE 7: Monitoreo y Alertas (Prioridad: MEDIA)

- [x] **T7.1** — Sistema de alertas implementado (frontend + backend) ✅
- [x] **T7.2** — Vista de alertas con filtros y marcar como leídas ✅
- [ ] **T7.3** — Implementar health checks periódicos de Freqtrade
- [ ] **T7.4** — Configurar alertas de Telegram (vía skill o directo)
- [ ] **T7.5** — Implementar alertas de drawdown máximo
- [ ] **T7.6** — Dashboard de métricas de sistema (CPU/RAM/disk)

### FASE 8: Producción y Seguridad (Prioridad: ALTA)

- [ ] **T8.1** — Migrar de Binance testnet a mainnet
- [ ] **T8.2** — Auditoría de seguridad de credenciales
- [ ] **T8.3** — Configurar backups automáticos de PostgreSQL
- [ ] **T8.4** — Configurar Tailscale para acceso remoto seguro
- [ ] **T8.5** — Documentar procedimientos de recuperación ante desastres
- [ ] **T8.6** — Configurar monitoreo de recursos del Mac mini

### FASE 9: Optimización y ML (Prioridad: BAJA)

- [ ] **T9.1** — Backtesting extensivo de estrategias
- [ ] **T9.2** — Optimización de hiperparámetros del modelo FreqAI
- [ ] **T9.3** — Experimentar con nuevos features/indicadores
- [ ] **T9.4** — Evaluar otros modelos (XGBoost, redes neuronales)
- [ ] **T9.5** — Implementar walk-forward optimization

---

## FIXES Y MEJORAS (Log Continuo)

| ID | Fecha | Tipo | Descripción | Estado |
|----|-------|------|-------------|--------|
| F001 | 2026-06-27 | Fix | Corregir import de supabase en scripts (usar REST API) | ✅ |
| F002 | 2026-06-27 | Mejora | Agregar componentes UI reutilizables | ✅ |
| F003 | 2026-06-27 | Mejora | Agregar hooks personalizados para Supabase | ✅ |
| F004 | 2026-06-27 | Mejora | Agregar SupabaseProvider para estado de conexión | ✅ |
| F005 | 2026-06-27 | Mejora | Diseño responsive mobile-first | ✅ |
| F006 | 2026-06-27 | Mejora | Sistema de notificaciones con polling | ✅ |
| F007 | 2026-06-27 | Mejora | Hook WebSocket para actualizaciones tiempo real | ✅ |
| F008 | 2026-06-27 | Mejora | Tests backend (FastAPI) | ✅ |
| F009 | 2026-06-27 | Mejora | Tests frontend (Vitest + Testing Library) | ✅ |
| F010 | 2026-06-27 | Fix | Corregir configuración Freqtrade (JWT, Telegram) | ✅ |
| F011 | 2026-06-27 | Mejora | Crear skill Hermes freqtrade-control | ✅ |

---

## NOTAS DE ARQUITECTURA

### Decisiones Clave

1. **Separación de esquemas**: Freqtrade usa `public`, la app usa `app` para evitar colisiones en migraciones.
2. **Trades unificados**: No se leen directamente las tablas internas de Freqtrade; se sincronizan vía webhook/skill.
3. **Credenciales cifradas**: `exchange_credentials` nunca se expone al frontend; solo el backend accede con `service_role`.
4. **RLS habilitado**: Todas las tablas públicas tienen Row Level Security para usuarios autenticados.
5. **Confirmación explícita**: Toda acción de control (compra/venta) requiere confirmación del usuario, nunca automática del LLM.

### Riesgos Identificados

| Riesgo | Mitigación |
|--------|------------|
| Freqtrade como "caja negra" | Tabla `ai_signals` con justificación de cada decisión |
| Pérdida de capital real | Empezar con dry-run, migrar gradualmente a testnet y luego mainnet |
| Credenciales expuestas | Cifrado en reposo, nunca en frontend, RLS habilitado |
| Recursos limitados (16GB RAM) | Monitoreo con `/api/v1/sysinfo`, optimización de modelos |
| API de Freqtrade caída | Health checks, alertas automáticas, logs |

---

## PRÓXIMOS PASOS INMEDIATOS

1. ✅ Crear carpeta `docs` y organizar documentación
2. ✅ Estructura de proyecto creada (backend, frontend, database)
3. ✅ Backend FastAPI con endpoints CRUD completos
4. ✅ Frontend React + TypeScript + Tailwind CSS
5. ✅ Schema `app` y migraciones SQL
6. ✅ Repositorio GitHub: https://github.com/Mimo13/ia-trading-autonoma-v3
7. ✅ Proyecto Supabase Cloud configurado
8. ✅ Variables de entorno (.env) configuradas
9. ✅ Migración ejecutada en Supabase Cloud
10. ✅ Datos de ejemplo insertados (3 estrategias, 30 trades, 30 snapshots, 3 alertas)
11. ✅ Componentes UI reutilizables creados
12. ✅ Scripts de setup y seed data

---

*Última actualización: 2026-06-27*
