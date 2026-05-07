# TenacitOS Pivot (Nuxt)

## What was implemented

- Unified API envelopes (`data` + `meta`) for OpenClaw, metrics, workspace, schedules and notifications.
- Client services now support both legacy payloads and the new envelope contract.
- Overview dashboard now includes bridge/realtime state, unread notifications and token totals.
- Scheduler supports manual execution (`POST /api/schedules/:id/run`) and a weekly timeline panel.
- Retro UX refinements: status bar in dashboard layout, stronger terminal-like panel treatment.
- Advanced features behind flags:
  - `NUXT_PUBLIC_OFFICE3D_ENABLED`
  - `NUXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED`
- Office 3D now includes a full scene module (`components/office3d/*`) with:
  - dynamic desks/avatars from live agent data
  - keyboard camera movement
  - operational hotspots
  - forced fallback mode (`/office?fallback=1`) for smoke testing.
- Added advanced cost analytics endpoint:
  - `GET /api/metrics/costs` (by-agent, by-model, trend, anomalies)
- Added baseline API rate limiting on sensitive routes:
  - `/api/auth/login`
  - `/api/openclaw/agents/:id/commands`
  - `/api/schedules/:id/run`

## New/updated endpoints

- `POST /api/schedules/:id/run` executes a schedule template immediately and updates `lastRunAt` / `nextRunAt`.
- Envelope response enabled on:
  - `/api/openclaw/agents`, `/api/openclaw/agents/:id`, `/api/openclaw/health`
  - `/api/metrics/tokens|models|sessions|errors`
  - `/api/workspace/tree|file|search`
  - `/api/notifications`, `/api/notifications/:id/read`, `/api/notifications/read-all`
  - `/api/schedules` and `/api/schedules/:id*`

## Security hardening

- Added default Nitro response headers for all routes:
  - `x-content-type-options: nosniff`
  - `x-frame-options: DENY`
  - `referrer-policy: strict-origin-when-cross-origin`
- Added structured security/event logging helper for backend routes.
- Expanded health payload with runtime uptime + bridge mode.

## QA

- Added smoke E2E suite: `e2e/pivot-smoke.spec.ts`
- Added unit coverage for cost analytics builder in `tests/metrics.server.test.ts`
