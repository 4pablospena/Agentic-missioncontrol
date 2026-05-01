export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Alert {
  id: string
  agentId?: string
  severity: AlertSeverity
  title: string
  message: string
  acknowledged: boolean
  createdAt: string
}
