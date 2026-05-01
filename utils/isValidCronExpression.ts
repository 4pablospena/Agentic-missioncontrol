import { Cron } from 'croner'

export function isValidCronExpression(expression: string): boolean {
  const trimmed = expression.trim()
  if (!trimmed)
    return false
  try {
    new Cron(trimmed)
    return true
  }
  catch {
    return false
  }
}

export function nextCronRunIso(expression: string, from: Date = new Date()): string | undefined {
  try {
    const job = new Cron(expression.trim())
    const next = job.nextRun(from)
    return next?.toISOString()
  }
  catch {
    return undefined
  }
}
