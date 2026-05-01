import { tickSchedules } from '../services/scheduler.server'
import { tickTaskRunner } from '../services/task-runner.server'

export default defineNitroPlugin(() => {
  if (process.env.TASK_AUTOMATION_DISABLED === '1')
    return

  const runnerMs = Number(process.env.TASK_RUNNER_INTERVAL_MS ?? 8000)
  const schedMs = Number(process.env.SCHEDULER_TICK_MS ?? 15000)

  setInterval(() => {
    void tickTaskRunner().catch(() => {})
  }, runnerMs)

  setInterval(() => {
    void tickSchedules().catch(() => {})
  }, schedMs)
})
