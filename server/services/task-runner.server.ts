import { completeTask, failTask, listTasks, setTaskProgress, startTask } from './tasks.server'
import { getOpenClawBridge } from './get-openclaw-bridge'

/** Picks up queued tasks and dispatches them to the Openclaw gateway. */
export async function tickTaskRunner(): Promise<void> {
  const queued = await listTasks({ status: 'queued' })
  const next = queued[0]
  if (next) {
    await startTask(next.id)
    await setTaskProgress(next.id, 10)

    if (next.assignedAgentId) {
      try {
        const bridge = await getOpenClawBridge()
        await bridge.sendCommand(next.assignedAgentId, {
          command: 'action.start',
          input: {
            taskId: next.id,
            ...(next.input ?? {}),
          },
        })
        // Gateway acknowledged the command — mark as in-progress.
        // Completion/failure will arrive via realtime events from the gateway.
        await setTaskProgress(next.id, 30)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : 'Gateway error'
        await failTask(next.id, message)
      }
    }
    else {
      // No agent assigned — complete immediately with a warning.
      await completeTask(next.id, { warning: 'No agent assigned; task not dispatched.' })
    }
  }
}
