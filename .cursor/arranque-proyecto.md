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

URLs utiles:

- App: `http://localhost:3000`
- Health Mission Control: `GET /api/health`
- Puente OpenClaw mock: `GET /api/openclaw/agents`
- Logs SQLite: `GET /api/logs`
- Detalle agente: `GET /api/openclaw/agents/:agentId`
- Comando (mock): `POST /api/openclaw/agents/:agentId/commands`
- WebSocket stub Nitro: fichero `server/routes/realtime.ws.ts` (ruta `/realtime`)

Nota: en Nitro conviene rutas tipo `*.get.ts` en `server/api/` (no siempre se registran bien los `index.get.ts` anidados).

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
