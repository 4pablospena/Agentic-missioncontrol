# Arranque del proyecto

Antes de implementar nuevas features, revisar:

- `.cursor/adr-fase-1-decisiones-tecnicas.md`
- `.cursor/fase-1-infraestructura-base.md`
- `.cursor/solid.md`

## Primera vez

```bash
cp .env.example .env
npm install
npm run dev
```

Configura en `.env` las variables de operador (ver `.env.example`): **`NUXT_MC_AUTH_EMAIL`** y **`NUXT_MC_AUTH_PASSWORD`** (solo desarrollo local) o **`NUXT_MC_AUTH_PASSWORD_HASH`** (produccion, ver `hashPassword` en nuxt-auth-utils). Tambien puedes usar los nombres legacy **`MISSION_CONTROL_OPERATOR_*`** en el entorno del proceso; el login los lee en servidor. La sesion usa `NUXT_SESSION_PASSWORD` (minimo 32 caracteres); en desarrollo el modulo puede generarlo si falta.

Tras cambiar `server/db/schema.ts`, ejecuta `npm run db:generate` y commit de `server/db/migrations/`. El arranque del servidor aplica migraciones desde `server/db/migrations` o, tras `npm run build`, desde `.output/server/db/migrations` (copia automatica en `postbuild`).

URLs utiles:

- App: `http://localhost:3000` (las rutas del dashboard redirigen a `/login` si no hay sesion)
- Health Mission Control: `GET /api/health`
- Puente OpenClaw mock: `GET /api/openclaw/agents`
- Logs SQLite: `GET /api/logs`, `POST /api/logs` (requieren sesion autenticada)
- Detalle agente: `GET /api/openclaw/agents/:agentId`
- Comando (mock): `POST /api/openclaw/agents/:agentId/commands`
- WebSocket stub Nitro: fichero `server/routes/realtime.ws.ts` (ruta `/realtime`)

Nota: en Nitro conviene rutas tipo `*.get.ts` en `server/api/` (no siempre se registran bien los `index.get.ts` anidados).

## Warnings en desarrollo

### Vue Router: `No match found for location "/api/v1/..."`

Este proyecto **no define** rutas de página para `/api/v1/*`. Si el terminal muestra un warning de Vue Router con un path tipo `/api/v1/agents/dependencies/metrics`, suele ser una **navegacion iniciada fuera del codigo** del repo (extension del navegador, automatizacion, otro cliente pegando al mismo `localhost`).

**Diagnosticar:** en el navegador abre DevTools, pestaña **Network**, localiza la peticion al path sospechoso y revisa **Initiator**. Repite en ventana **incognito sin extensiones**; si el warning desaparece, la causa es casi seguro externa.

**Si necesitas ese endpoint en Nitro:** anade una ruta en `server/api/` (o proxy al gateway real); eso cubre llamadas HTTP al servidor, no sustituye localizar quien hace `navigateTo`/SPA hacia esa URL por error.

### Vite: dependencias descubiertas en tiempo de ejecucion (`@vue/devtools-*`)

El proyecto incluye `vite.optimizeDeps.include` para devtools en `nuxt.config.ts` y reduce recargas en dev. Ver mensajes ocasionales de Vite es normal si cambias versiones o deps.

## Variables clave

Ver `.env.example`. Sin OpenClaw local usar:

```bash
OPENCLAW_BRIDGE_MODE=mock
```

Con Gateway OpenClaw (cuando exista en tu maquina):

```bash
OPENCLAW_BRIDGE_MODE=gateway
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=tu_token
```
