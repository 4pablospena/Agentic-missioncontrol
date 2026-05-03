export type NotificationSeverity = 'info' | 'success' | 'warn' | 'error'

export type NotificationStatusFilter = 'unread' | 'all'

export interface Notification {
  id: string
  type: string
  severity: NotificationSeverity
  title: string
  body?: string
  payload?: Record<string, unknown>
  read: boolean
  createdAt: string
}
