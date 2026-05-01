import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/** Phase 1 stub tables; auth remains env/session-based. No FK from logs.agent_id to avoid orphan rows in local DBs. */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
})

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  model: text('model').notNull(),
  currentTaskId: text('current_task_id'),
  tokenUsage: integer('token_usage').notNull().default(0),
  lastSeenAt: text('last_seen_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  agentId: text('agent_id'),
  level: text('level').notNull(),
  message: text('message').notNull(),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
})

export const realtimeEvents = sqliteTable('realtime_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  payloadJson: text('payload_json'),
  createdAt: text('created_at').notNull(),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  agentId: text('agent_id'),
  progress: integer('progress').notNull().default(0),
  inputJson: text('input_json'),
  resultJson: text('result_json'),
  error: text('error'),
  scheduledAt: text('scheduled_at'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const taskEvents = sqliteTable('task_events', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  type: text('type').notNull(),
  payloadJson: text('payload_json'),
  createdAt: text('created_at').notNull(),
})

export const taskSchedules = sqliteTable('task_schedules', {
  id: text('id').primaryKey(),
  taskTemplateJson: text('task_template_json').notNull(),
  cronExpression: text('cron_expression').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  nextRunAt: text('next_run_at'),
  lastRunAt: text('last_run_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  agentId: text('agent_id'),
  severity: text('severity').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  acknowledged: integer('acknowledged', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
})
