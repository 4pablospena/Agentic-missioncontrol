import type { MissionControlEvent, MissionControlEventType } from '~/models/realtime'
import type { NotificationSeverity } from '~/models/notification'
import { createNotification } from '../services/notifications.server'

export type RealtimePeer = {
  send: (data: string) => void
}

const peers = new Set<RealtimePeer>()

export function registerRealtimePeer(peer: RealtimePeer): void {
  peers.add(peer)
}

export function unregisterRealtimePeer(peer: RealtimePeer): void {
  peers.delete(peer)
}

/**
 * Map of event types that always get persisted to the notifications inbox,
 * with their default severity + a builder for the human-readable title.
 *
 * Anything not listed here is wire-only — keeps current call sites untouched
 * unless they pass `{ persist: true | { ... } }` explicitly.
 */
interface PersistDefault {
  severity: NotificationSeverity
  buildTitle: (event: MissionControlEvent) => string
  buildBody?: (event: MissionControlEvent) => string | undefined
}

function payloadString(event: MissionControlEvent, key: string): string | undefined {
  const v = (event.payload as Record<string, unknown> | undefined)?.[key]
  return typeof v === 'string' ? v : undefined
}

const EVENT_NOTIFICATION_DEFAULTS: Partial<Record<MissionControlEventType, PersistDefault>> = {
  'alert.created': {
    severity: 'error',
    buildTitle: e => payloadString(e, 'title') ?? 'New alert',
    buildBody: e => payloadString(e, 'message'),
  },
  'task.failed': {
    severity: 'error',
    buildTitle: e => `Task failed: ${payloadString(e, 'title') ?? payloadString(e, 'taskId') ?? 'unknown'}`,
    buildBody: e => payloadString(e, 'error'),
  },
  'task.completed': {
    severity: 'success',
    buildTitle: e => `Task completed: ${payloadString(e, 'title') ?? payloadString(e, 'taskId') ?? 'unknown'}`,
  },
  'memory.snapshot.exported': {
    severity: 'info',
    buildTitle: () => 'Memory snapshot exported',
  },
  'memory.snapshot.imported': {
    severity: 'info',
    buildTitle: () => 'Memory snapshot imported',
  },
}

export interface BroadcastOptions {
  /**
   * `true`  -> persist using EVENT_NOTIFICATION_DEFAULTS for the event type.
   * object  -> persist with the explicit fields (override defaults).
   * `false` -> never persist (overrides defaults).
   * undefined / omitted -> persist iff the type is in EVENT_NOTIFICATION_DEFAULTS.
   */
  persist?:
    | boolean
    | {
      severity: NotificationSeverity
      title: string
      body?: string
    }
}

/**
 * Sends `event` to every connected peer over the realtime websocket and,
 * when applicable, persists a row in the notifications inbox.
 *
 * The persistence is best-effort: failures only log and never block the
 * broadcast. This keeps the wire fan-out behaviour identical to before
 * for callers that don't pass `opts`.
 */
export function broadcastMissionControlEvent(
  event: MissionControlEvent,
  opts?: BroadcastOptions,
): void {
  const raw = JSON.stringify(event)
  for (const p of [...peers]) {
    try {
      p.send(raw)
    }
    catch {
      peers.delete(p)
    }
  }

  void persistIfRequested(event, opts).catch((err) => {
    console.error('[realtime-broadcast] failed to persist notification', err)
  })
}

async function persistIfRequested(
  event: MissionControlEvent,
  opts?: BroadcastOptions,
): Promise<void> {
  if (opts?.persist === false)
    return

  if (opts?.persist && typeof opts.persist === 'object') {
    await createNotification({
      type: event.type,
      severity: opts.persist.severity,
      title: opts.persist.title,
      body: opts.persist.body,
      payload: event.payload as Record<string, unknown> | undefined,
    })
    return
  }

  const fromDefaults = EVENT_NOTIFICATION_DEFAULTS[event.type]
  if (!fromDefaults)
    return
  if (opts?.persist === undefined && fromDefaults == null)
    return

  await createNotification({
    type: event.type,
    severity: fromDefaults.severity,
    title: fromDefaults.buildTitle(event),
    body: fromDefaults.buildBody?.(event),
    payload: event.payload as Record<string, unknown> | undefined,
  })
}
