# Skill de Hermes Agent: `freqtrade-control`

Skill (estándar agentskills.io) para instalar en `~/.hermes/skills/freqtrade-control/` en el Mac mini M4, que envuelve la REST API nativa de Freqtrade y la expone como comandos conversacionales dentro de Hermes Agent.

---

## 1. Autenticación contra Freqtrade

La REST API de Freqtrade (puerto por defecto `8080`) usa JWT:

1. `POST /api/v1/token/login` con `username`/`password` (definidos en `config.json` → `api_server`) → devuelve `access_token` y `refresh_token`.
2. Cada llamada posterior usa `Authorization: Bearer <access_token>`.
3. `POST /api/v1/token/refresh` con el `refresh_token` cuando expire.

**Importante de seguridad:** la API de Freqtrade debe escuchar solo en `127.0.0.1` o en la interfaz de Tailscale del Mac mini — nunca expuesta directamente a internet. La skill, al correr en el mismo equipo o en la red de Tailscale, accede sin abrir puertos públicos.

---

## 2. Estructura de la skill

```
freqtrade-control/
├── skill.yaml          # manifiesto (nombre, descripción, comandos, permisos)
├── handler.py          # lógica de llamadas a la API de Freqtrade
├── auth.py             # gestión de token JWT (login/refresh/caché)
└── config.example.yaml # URL del bot, credenciales, timeouts
```

`skill.yaml` (extracto):

```yaml
name: freqtrade-control
description: >
  Permite consultar el estado, rendimiento y balance de las estrategias de
  Freqtrade en ejecución, y ejecutar acciones de control (pausar, forzar
  entrada/salida) bajo confirmación explícita del usuario.
risk_level: high   # requiere confirmación antes de cualquier acción de escritura
commands:
  - intent: consultar_estado
  - intent: consultar_rendimiento
  - intent: consultar_balance
  - intent: pausar_estrategia
  - intent: forzar_venta
  - intent: forzar_compra
```

---

## 3. Endpoints expuestos

### 3.1 Monitorización (solo lectura — sin confirmación)

| Endpoint Freqtrade | Método | Para qué lo usa la skill |
|---|---|---|
| `/api/v1/ping` | GET | Comprobar que el bot está vivo antes de cualquier otra llamada. |
| `/api/v1/status` | GET | Operaciones abiertas en este momento (par, precio entrada, P&L flotante). |
| `/api/v1/profit` | GET | Resumen de beneficio total, ratio de aciertos, drawdown. |
| `/api/v1/performance` | GET | Rendimiento desglosado por par (qué activos están funcionando mejor). |
| `/api/v1/balance` | GET | Balance actual por moneda en el exchange. |
| `/api/v1/daily` | GET | Beneficio/pérdida agregado por día — útil para "¿cómo fue ayer?". |
| `/api/v1/trades` | GET | Histórico completo de operaciones cerradas. |
| `/api/v1/whitelist` / `/blacklist` | GET | Qué pares están habilitados/excluidos. |
| `/api/v1/strategies` / `/strategy/{name}` | GET | Código y parámetros de la estrategia activa. |
| `/api/v1/logs` | GET | Últimas líneas de log — para diagnosticar errores. |
| `/api/v1/sysinfo` | GET | CPU/RAM del proceso — relevante dado el límite de 16GB del Mac mini. |

### 3.2 Control (requieren confirmación explícita del usuario)

| Endpoint Freqtrade | Método | Para qué lo usa la skill |
|---|---|---|
| `/api/v1/forceentry` | POST | "Compra ahora mismo X" — abre una posición manualmente. |
| `/api/v1/forceexit` | POST | "Cierra la posición de X" — vende una posición abierta. |
| `/api/v1/stopbuy` | POST | Bloquea nuevas entradas sin detener el bot (sigue gestionando lo abierto). |
| `/api/v1/start` / `/stop` | POST | Arranca o detiene completamente el bot. |
| `/api/v1/reload_config` | POST | Recarga `config.json` tras un cambio de parámetros. |

### 3.3 Tiempo real (opcional, fase posterior)

| Endpoint | Tipo | Uso |
|---|---|---|
| `/api/v1/message/ws` | WebSocket | Stream de eventos (nueva entrada, nueva salida, error) para que Hermes notifique proactivamente sin tener que preguntar. |

---

## 4. Mapeo de intención conversacional → endpoint

| El usuario dice | Endpoint llamado | Tipo |
|---|---|---|
| "¿Cómo va la estrategia de SOL?" | `/api/v1/status` + `/api/v1/profit` (filtrado por par) | Lectura |
| "¿Cuánto llevamos ganado esta semana?" | `/api/v1/daily` | Lectura |
| "¿Qué estrategia está rindiendo mejor?" | `/api/v1/performance` | Lectura |
| "Pausa las nuevas entradas" | `/api/v1/stopbuy` | Control (confirmación) |
| "Vende la posición de DOGE" | `/api/v1/forceexit` | Control (confirmación) |
| "Para el bot" | `/api/v1/stop` | Control (confirmación) |

---

## 5. Manejo de errores y resiliencia

- Si `/api/v1/ping` falla → la skill responde "Freqtrade no está accesible" en vez de propagar el error crudo.
- Token JWT expirado → `auth.py` reintenta una vez con `/token/refresh` antes de fallar.
- Cualquier endpoint de la sección 3.2 debe pasar primero por confirmación explícita en el flujo conversacional (no ejecutar nunca una orden de compra/venta solo porque el LLM "interpretó" que era buena idea).
- Las llamadas de control quedan registradas (qué se pidió, cuándo, resultado) — alimenta la tabla `app.ai_signals` / `app.alerts` del esquema de Supabase (ver fichero adjunto), para mantener trazabilidad ante el riesgo de "caja negra".
