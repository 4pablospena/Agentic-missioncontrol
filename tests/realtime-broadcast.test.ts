import { beforeEach, describe, expect, it, vi } from 'vitest'

const createNotificationMock = vi.hoisted(() => vi.fn(async () => ({ id: 'n', read: false })))

vi.mock('../server/services/notifications.server', () => ({
  createNotification: createNotificationMock,
}))

import {
  broadcastMissionControlEvent,
  registerRealtimePeer,
  unregisterRealtimePeer,
} from '../server/utils/realtime-broadcast'

function flushMicrotasks() {
  return new Promise<void>(resolve => setImmediate(resolve))
}

describe('broadcastMissionControlEvent', () => {
  let send: ReturnType<typeof vi.fn>
  let peer: { send: typeof send }

  beforeEach(() => {
    createNotificationMock.mockClear()
    send = vi.fn()
    peer = { send }
    registerRealtimePeer(peer)
  })

  function unregister() {
    unregisterRealtimePeer(peer)
  }

  it('forwards the event to every peer (wire-only by default)', async () => {
    broadcastMissionControlEvent({
      id: 'e1',
      type: 'log.created',
      payload: { message: 'hi' },
      createdAt: '2026-05-03T00:00:00.000Z',
    })
    await flushMicrotasks()
    expect(send).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).not.toHaveBeenCalled()
    unregister()
  })

  it('persists notifications for allowlisted event types', async () => {
    broadcastMissionControlEvent({
      id: 'e2',
      type: 'task.failed',
      payload: { taskId: 't1', title: 'cleanup', error: 'boom' },
      createdAt: '2026-05-03T00:00:01.000Z',
    })
    await flushMicrotasks()
    expect(createNotificationMock).toHaveBeenCalledTimes(1)
    expect(createNotificationMock.mock.calls[0]![0]).toMatchObject({
      type: 'task.failed',
      severity: 'error',
      title: expect.stringContaining('cleanup'),
      body: 'boom',
    })
    unregister()
  })

  it('honors explicit persist override with severity/title', async () => {
    broadcastMissionControlEvent(
      {
        id: 'e3',
        type: 'log.created',
        payload: { ok: true },
        createdAt: '2026-05-03T00:00:02.000Z',
      },
      { persist: { severity: 'info', title: 'Custom title' } },
    )
    await flushMicrotasks()
    expect(createNotificationMock).toHaveBeenCalledTimes(1)
    expect(createNotificationMock.mock.calls[0]![0]).toMatchObject({
      type: 'log.created',
      severity: 'info',
      title: 'Custom title',
    })
    unregister()
  })

  it('persist=false suppresses persistence even for allowlisted types', async () => {
    broadcastMissionControlEvent(
      {
        id: 'e4',
        type: 'alert.created',
        payload: { title: 'will not persist' },
        createdAt: '2026-05-03T00:00:03.000Z',
      },
      { persist: false },
    )
    await flushMicrotasks()
    expect(createNotificationMock).not.toHaveBeenCalled()
    unregister()
  })
})
