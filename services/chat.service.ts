import type {
  ChatMessage,
  Conversation,
  CreateConversationPayload,
  SendChatMessagePayload,
  SendChatMessageResult,
} from '~/models/chat'
import type { ApiClient } from '~/services/api-client.service'

export interface ChatService {
  listConversations(agentId?: string): Promise<Conversation[]>
  createConversation(payload: CreateConversationPayload): Promise<Conversation>
  listMessages(conversationId: string): Promise<ChatMessage[]>
  sendMessage(agentId: string, payload: SendChatMessagePayload): Promise<SendChatMessageResult>
}

export function createChatService(client: ApiClient): ChatService {
  return {
    listConversations(agentId?: string) {
      const params = new URLSearchParams()
      if (agentId?.trim())
        params.set('agentId', agentId.trim())
      const qs = params.toString()
      return client.get<Conversation[]>(`/api/chat/conversations${qs ? `?${qs}` : ''}`)
    },
    createConversation(payload: CreateConversationPayload) {
      return client.post<CreateConversationPayload, Conversation>(
        '/api/chat/conversations',
        payload,
      )
    },
    listMessages(conversationId: string) {
      return client.get<ChatMessage[]>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      )
    },
    sendMessage(agentId: string, payload: SendChatMessagePayload) {
      return client.post<SendChatMessagePayload, SendChatMessageResult>(
        `/api/chat/${encodeURIComponent(agentId)}/messages`,
        payload,
      )
    },
  }
}
