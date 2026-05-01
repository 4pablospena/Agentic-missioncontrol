import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  loginSessionCookie,
  startIntegrationServer,
  type IntegrationServer,
} from './helpers/server'
import { seedTaskFailed } from './helpers/seed-task-failed'

describe('tasks & schedules API (integration)', () => {
  let srv: IntegrationServer
  let cookie: string

  beforeAll(async () => {
    srv = await startIntegrationServer()
    cookie = await loginSessionCookie(srv.baseUrl, srv.auth.email, srv.auth.password)
  }, 120_000)

  afterAll(() => {
    srv?.stop()
  })

  it('GET /api/tasks returns array', async () => {
    const res = await fetch(`${srv.baseUrl}/api/tasks`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it('POST /api/tasks creates task and GET /api/tasks/:id returns it', async () => {
    const title = `integration-${Date.now()}`
    const create = await fetch(`${srv.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        priority: 'normal',
      }),
    })
    expect(create.ok).toBe(true)
    const task = await create.json() as { id: string, title: string, status: string }
    expect(task.title).toBe(title)
    expect(task.status).toBe('queued')

    const one = await fetch(`${srv.baseUrl}/api/tasks/${task.id}`, {
      headers: { Cookie: cookie },
    })
    expect(one.ok).toBe(true)
    const again = await one.json() as { id: string, title: string }
    expect(again.id).toBe(task.id)
    expect(again.title).toBe(title)
  })

  it('PATCH /api/tasks/:id updates fields', async () => {
    const create = await fetch(`${srv.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `patch-me-${Date.now()}`,
        priority: 'low',
      }),
    })
    expect(create.ok).toBe(true)
    const task = await create.json() as { id: string }

    const patch = await fetch(`${srv.baseUrl}/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'patched-title',
        priority: 'high',
      }),
    })
    expect(patch.ok).toBe(true)
    const updated = await patch.json() as { title: string, priority: string }
    expect(updated.title).toBe('patched-title')
    expect(updated.priority).toBe('high')
  })

  it('POST /api/tasks/:id/retry moves failed task to queued', async () => {
    const create = await fetch(`${srv.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `retry-me-${Date.now()}`,
        priority: 'normal',
      }),
    })
    expect(create.ok).toBe(true)
    const task = await create.json() as { id: string }

    seedTaskFailed(srv.dbPath, task.id)

    const retry = await fetch(`${srv.baseUrl}/api/tasks/${task.id}/retry`, {
      method: 'POST',
      headers: { Cookie: cookie },
    })
    expect(retry.ok).toBe(true)
    const retried = await retry.json() as { status: string, error?: string }
    expect(retried.status).toBe('queued')
    expect(retried.error).toBeUndefined()
  })

  it('POST /api/schedules creates schedule with nextRunAt', async () => {
    const title = `cron-task-${Date.now()}`
    const res = await fetch(`${srv.baseUrl}/api/schedules`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cronExpression: '0 * * * *',
        enabled: true,
        taskTemplate: {
          title,
          priority: 'normal',
        },
      }),
    })
    expect(res.ok).toBe(true)
    const schedule = await res.json() as {
      id: string
      cronExpression: string
      nextRunAt?: string
      taskTemplate: { title: string }
    }
    expect(schedule.taskTemplate.title).toBe(title)
    expect(schedule.cronExpression).toBe('0 * * * *')
    expect(schedule.nextRunAt).toMatch(/\d{4}-/)

    const list = await fetch(`${srv.baseUrl}/api/schedules`, {
      headers: { Cookie: cookie },
    })
    expect(list.ok).toBe(true)
    const rows = await list.json() as Array<{ id: string }>
    expect(rows.some(r => r.id === schedule.id)).toBe(true)
  })
})
