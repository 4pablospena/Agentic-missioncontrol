import { completeTask, listTasks, setTaskProgress, startTask } from './tasks.server'

/** MVP internal runner: advances running tasks and starts one queued task per tick. */
export async function tickTaskRunner(): Promise<void> {
  const running = await listTasks({ status: 'running' })
  for (const t of running) {
    if (t.progress >= 100) {
      await completeTask(t.id, { simulated: true })
    }
    else {
      await setTaskProgress(t.id, Math.min(100, t.progress + 34))
    }
  }

  const queued = await listTasks({ status: 'queued' })
  const next = queued[0]
  if (next) {
    await startTask(next.id)
    await setTaskProgress(next.id, Math.min(100, next.progress + 20))
  }
}
