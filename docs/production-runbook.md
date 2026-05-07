# Production Runbook

## Required environment

- `NUXT_SESSION_PASSWORD` (min 32 chars)
- `NUXT_MC_AUTH_EMAIL`
- `NUXT_MC_AUTH_PASSWORD` or `NUXT_MC_AUTH_PASSWORD_HASH`
- `OPENCLAW_BRIDGE_MODE` (`mock` or `gateway`)
- `OPENCLAW_GATEWAY_URL` / `OPENCLAW_GATEWAY_WS` when using gateway mode

## Feature flags

- `NUXT_PUBLIC_OFFICE3D_ENABLED=true` to expose Office 3D.
- `NUXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED=true` to expose advanced cost analytics.

## Deploy with PM2

1. `npm ci`
2. `./scripts/prod-start-pm2.sh`
3. Validate:
   - `pm2 status`
   - `curl -sSf http://127.0.0.1:3000/api/health`

## Deploy with systemd

1. Build: `npm run build`
2. Copy `scripts/mission-control.service.example` to `/etc/systemd/system/mission-control.service`
3. `sudo systemctl daemon-reload`
4. `sudo systemctl enable --now mission-control`
5. `sudo journalctl -u mission-control -f`

## Rollback checklist

1. Keep previous release dir and `.env`.
2. Stop process (`pm2 stop mission-control` or `systemctl stop mission-control`).
3. Re-point symlink / working dir to previous release.
4. Start service and validate `/api/health`.
5. Smoke check: `/`, `/monitoring`, `/scheduler`, `/workspace`, `/office`.
