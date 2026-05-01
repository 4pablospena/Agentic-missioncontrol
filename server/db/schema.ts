import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  agentId: text('agent_id'),
  level: text('level').notNull(),
  message: text('message').notNull(),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
})
