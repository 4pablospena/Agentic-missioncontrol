import type { ChatMessage, SendChatMessagePayload, SendChatMessageResult } from '~/models/chat'
import { createLogEntry } from './logger.server'
import { getOpenClawBridge } from './get-openclaw-bridge'
import {
  appendChatMessage,
  assertConversationAgent,
  createConversation,
  listMessages,
} from './chat.server'
import { appendMemoryFromChat, getMemoryItem, semanticSearchMemory } from './memory.server'

async function resolveBridgeAgent(agentId: string) {
  try {
    const bridge = await getOpenClawBridge()
    return await bridge.getAgent(agentId.trim())
  }
  catch {
    return null
  }
}

export async function orchestrateAgentChatMessage(
  agentId: string,
  payload: SendChatMessagePayload,
): Promise<SendChatMessageResult> {
  if (!(await resolveBridgeAgent(agentId))) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Agent lookup unavailable (use OPENCLAW_BRIDGE_MODE=mock locally or extend the gateway bridge).',
    })
  }

  const c = useRuntimeConfig()
  const snippetLimit = Number(c.memorySemanticContextLimit) || 5
  const recentCap = Number(c.memoryChatRecentMessages) || 40
  const embedTurns = Boolean(c.memoryEmbedChatTurns)

  let conversationId = payload.conversationId?.trim()
  if (conversationId)
    assertConversationAgent(conversationId, agentId)
  else
    conversationId = createConversation({ agentId: agentId.trim(), title: payload.content.slice(0, 48) }).id

  const userMessage = appendChatMessage({
    conversationId,
    agentId: agentId.trim(),
    role: 'user',
    content: payload.content,
  })

  const snippets: string[] = []
  if (payload.contextMemoryIds?.length) {
    for (const mid of payload.contextMemoryIds) {
      const m = getMemoryItem(mid)
      if (m && m.agentId === agentId.trim())
        snippets.push(m.content)
    }
  }

  if (snippetLimit > 0 && snippets.length < snippetLimit) {
    const hits = await semanticSearchMemory({
      query: payload.content,
      agentId: agentId.trim(),
      limit: snippetLimit - snippets.length,
    })
    for (const h of hits) {
      if (snippets.length >= snippetLimit)
        break
      snippets.push(h.memory.content)
    }
  }

  const recentAsc = listMessages(conversationId)
  const recentTail = recentAsc.slice(-recentCap)

  let assistantText = ''
  try {
    const bridge = await getOpenClawBridge()
    const cmd = await bridge.sendCommand(agentId.trim(), {
      command: 'chat.message',
      input: {
        content: payload.content,
        conversationId,
        contextSnippets: snippets,
        recentMessages: recentTail.map(m => ({ role: m.role, content: m.content })),
      },
    })
    assistantText = String(
      cmd.detail && typeof cmd.detail === 'object' && 'response' in cmd.detail
        ? (cmd.detail as { response?: unknown }).response
        : cmd.message ?? '',
    )
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bridge error'
    assistantText = `[assistant unavailable] ${msg}`
    await createLogEntry({
      agentId: agentId.trim(),
      level: 'warn',
      message: 'chat.bridge.failed',
      metadata: { conversationId, error: msg },
    })
  }

  if (!assistantText.trim())
    assistantText = '[assistant] (empty response)'

  const assistantMessage = appendChatMessage({
    conversationId,
    agentId: agentId.trim(),
    role: 'assistant',
    content: assistantText,
    metadata: { contextSnippetCount: snippets.length },
  })

  if (embedTurns) {
    await appendMemoryFromChat({
      agentId: agentId.trim(),
      sessionId: conversationId,
      content: `User: ${payload.content}\nAssistant: ${assistantText}`,
      metadata: { conversationId },
    })
  }

  await createLogEntry({
    agentId: agentId.trim(),
    level: 'info',
    message: 'chat.turn.completed',
    metadata: { conversationId, userMessageId: userMessage.id, assistantMessageId: assistantMessage.id },
  })

  return { conversationId, userMessage, assistantMessage }
}
