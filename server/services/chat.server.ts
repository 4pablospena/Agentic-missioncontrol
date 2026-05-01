import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import type { ChatMessage, ChatRole, Conversation, CreateConversationPayload } from '~/models/chat'
import type { MissionControlEvent } from '~/models/realtime'
import { getDb } from '../db/client'
import { chatMessages, conversations } from '../db/schema'
import { broadcastMissionControlEvent } from '../utils/realtime-broadcast'

function nowIso(): string {
  return new Date().toISOString()
}

function parseMeta(raw: string | null): Record<string, unknown> | undefined {
  if (!raw)
    return undefined
  try {
    const v = JSON.parse(raw) as unknown
    return typeof v === 'object' && v !== null && !Array.isArray(v)
      ? v as Record<string, unknown>
      : undefined
  }
  catch {
    return undefined
  }
}

function broadcastEvt(partial: Omit<MissionControlEvent, 'id' | 'createdAt'> & { id?: string }) {
  const full: MissionControlEvent = {
    id: partial.id ?? randomUUID(),
    type: partial.type,
    payload: partial.payload,
    createdAt: partial.createdAt ?? nowIso(),
  }
  broadcastMissionControlEvent(full)
}

export function mapConversationRow(row: typeof conversations.$inferSelect): Conversation {
  return {
    id: row.id,
    agentId: row.agentId,
    title: row.title,
    lastMessageAt: row.lastMessageAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapChatMessageRow(row: typeof chatMessages.$inferSelect): ChatMessage {
  return {
    id: row.id,
    agentId: row.agentId,
    conversationId: row.conversationId,
    role: row.role as ChatRole,
    content: row.content,
    metadata: parseMeta(row.metadataJson),
    createdAt: row.createdAt,
  }
}

export function listConversations(filters: { agentId?: string }): Conversation[] {
  const db = getDb()
  const base = db.select().from(conversations)
  const qb = filters.agentId?.trim()
    ? base.where(eq(conversations.agentId, filters.agentId.trim()))
    : base
  const rows = qb.orderBy(desc(conversations.updatedAt)).all()
  return rows.map(mapConversationRow)
}

export function getConversation(id: string): Conversation | null {
  const db = getDb()
  const row = db.select().from(conversations).where(eq(conversations.id, id)).get()
  return row ? mapConversationRow(row) : null
}

export function createConversation(payload: CreateConversationPayload): Conversation {
  const db = getDb()
  const id = randomUUID()
  const ts = nowIso()
  const title = payload.title?.trim() || 'Conversation'

  db.insert(conversations).values({
    id,
    agentId: payload.agentId.trim(),
    title,
    createdAt: ts,
    updatedAt: ts,
    lastMessageAt: null,
  }).run()

  const row = db.select().from(conversations).where(eq(conversations.id, id)).get()
  if (!row)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create conversation' })

  broadcastEvt({
    type: 'chat.conversation.created',
    payload: { conversationId: id, agentId: payload.agentId.trim() },
  })

  return mapConversationRow(row)
}

export function listMessages(conversationId: string): ChatMessage[] {
  const db = getDb()
  const rows = db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(desc(chatMessages.createdAt))
    .all()
  return rows.reverse().map(mapChatMessageRow)
}

export function appendChatMessage(params: {
  conversationId: string
  agentId: string
  role: ChatRole
  content: string
  metadata?: Record<string, unknown>
}): ChatMessage {
  const db = getDb()
  const id = randomUUID()
  const ts = nowIso()

  db.insert(chatMessages).values({
    id,
    conversationId: params.conversationId,
    agentId: params.agentId.trim(),
    role: params.role,
    content: params.content,
    metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
    createdAt: ts,
  }).run()

  db.update(conversations)
    .set({
      updatedAt: ts,
      lastMessageAt: ts,
    })
    .where(eq(conversations.id, params.conversationId))
    .run()

  const row = db.select().from(chatMessages).where(eq(chatMessages.id, id)).get()
  if (!row)
    throw createError({ statusCode: 500, statusMessage: 'Failed to persist chat message' })

  const msg = mapChatMessageRow(row)

  broadcastEvt({
    type: 'chat.message.created',
    payload: {
      messageId: msg.id,
      conversationId: params.conversationId,
      agentId: params.agentId.trim(),
      role: msg.role,
    },
  })

  return msg
}

export function assertConversationAgent(conversationId: string, agentId: string): Conversation {
  const conv = getConversation(conversationId)
  if (!conv)
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  if (conv.agentId !== agentId.trim())
    throw createError({ statusCode: 403, statusMessage: 'Conversation does not belong to agent' })
  return conv
}
