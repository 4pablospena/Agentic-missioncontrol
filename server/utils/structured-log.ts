type LogLevel = 'info' | 'warn' | 'error'

export function logStructured(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  const payload = {
    level,
    message,
    ts: new Date().toISOString(),
    ...context,
  }
  if (level === 'error')
    console.error(JSON.stringify(payload))
  else if (level === 'warn')
    console.warn(JSON.stringify(payload))
  else
    console.info(JSON.stringify(payload))
}
