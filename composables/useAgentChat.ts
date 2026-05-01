import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import type { ChatMessage, Conversation } from '~/models/chat'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createChatService, type ChatService } from '~/services/chat.service'

export interface UseAgentChatOptions {
  chatService?: ChatService
  events?: Ref<MissionControlEvent[]>
}

function isChatRealtimeType(type: string): boolean {
  return type.startsWith('chat.')
}

export function useAgentChat(options: UseAgentChatOptions = {}) {
  const { apiBase } = useMcConfig()
  const agentId = ref('')
  const conversations = ref<Conversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const selectedConversationId = ref<string | null>(null)
  const pending = ref(false)
  const sending = ref(false)
  const errorMsg = ref('')

  function resolveService(): ChatService {
    if (options.chatService)
      return options.chatService
    return createChatService(createApiClient(useRequestFetch(), apiBase.value))
  }

  async function loadConversations() {
    if (!agentId.value.trim()) {
      conversations.value = []
      return
    }
    pending.value = true
    errorMsg.value = ''
    try {
      conversations.value = await resolveService().listConversations(agentId.value.trim())
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function loadMessages() {
    if (!selectedConversationId.value) {
      messages.value = []
      return
    }
    pending.value = true
    errorMsg.value = ''
    try {
      messages.value = await resolveService().listMessages(selectedConversationId.value)
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function sendMessage(content: string) {
    if (!agentId.value.trim()) {
      errorMsg.value = 'Select an agent first'
      return
    }
    sending.value = true
    errorMsg.value = ''
    try {
      const res = await resolveService().sendMessage(agentId.value.trim(), {
        conversationId: selectedConversationId.value ?? undefined,
        content,
      })
      selectedConversationId.value = res.conversationId
      await loadMessages()
      await loadConversations()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
    finally {
      sending.value = false
    }
  }

  function selectConversation(id: string) {
    selectedConversationId.value = id
  }

  async function startNewConversation() {
    if (!agentId.value.trim()) {
      errorMsg.value = 'Select an agent first'
      return
    }
    errorMsg.value = ''
    try {
      const c = await resolveService().createConversation({
        agentId: agentId.value.trim(),
        title: 'New conversation',
      })
      selectedConversationId.value = c.id
      await loadConversations()
      await loadMessages()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  watch(agentId, async () => {
    selectedConversationId.value = null
    messages.value = []
    await loadConversations()
  })

  watch(selectedConversationId, () => void loadMessages())

  async function refreshChat() {
    await loadConversations()
    await loadMessages()
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last && isChatRealtimeType(last.type)) {
        void loadConversations()
        void loadMessages()
      }
    },
    { deep: true },
  )

  return {
    agentId,
    conversations: readonly(conversations),
    messages: readonly(messages),
    selectedConversationId,
    pending: readonly(pending),
    sending: readonly(sending),
    errorMsg: readonly(errorMsg),
    loadConversations,
    loadMessages,
    refreshChat,
    sendMessage,
    selectConversation,
    startNewConversation,
  }
}
