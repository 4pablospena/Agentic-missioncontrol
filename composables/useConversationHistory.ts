import { readonly, ref } from 'vue'
import type { ChatMessage } from '~/models/chat'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createChatService, type ChatService } from '~/services/chat.service'

export interface UseConversationHistoryOptions {
  chatService?: ChatService
}

/** Focused loader for a single conversation’s messages (inject `chatService` in tests). */
export function useConversationHistory(options: UseConversationHistoryOptions = {}) {
  const { apiBase } = useMcConfig()
  const messages = ref<ChatMessage[]>([])
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): ChatService {
    if (options.chatService)
      return options.chatService
    return createChatService(createApiClient(useRequestFetch(), apiBase.value))
  }

  async function loadMessages(conversationId: string) {
    pending.value = true
    errorMsg.value = ''
    try {
      messages.value = await resolveService().listMessages(conversationId)
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  return {
    messages: readonly(messages),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    loadMessages,
  }
}
