export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  agentId: string
  conversationId: string
  role: ChatRole
  content: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface Conversation {
  id: string
  agentId: string
  title: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface SendChatMessagePayload {
  conversationId?: string
  content: string
  contextMemoryIds?: string[]
}

export interface CreateConversationPayload {
  agentId: string
  title?: string
}

/** Result of POST `/api/chat/:agentId/messages`. */
export interface SendChatMessageResult {
  conversationId: string
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}
