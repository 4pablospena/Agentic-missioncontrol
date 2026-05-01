import { z } from 'zod'

export const createConversationBodySchema = z.object({
  agentId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
})

export const sendChatMessageBodySchema = z.object({
  conversationId: z.string().optional(),
  content: z.string().min(1),
  contextMemoryIds: z.array(z.string()).optional(),
})
