<script setup lang="ts">
import { ref } from 'vue'
import type { ChatMessage, Conversation } from '~/models/chat'
import ChatComposer from './ChatComposer.vue'
import ChatMessageList from './ChatMessageList.vue'
import ConversationList from './ConversationList.vue'

withDefaults(
  defineProps<{
    conversations: Conversation[]
    messages: ChatMessage[]
    selectedConversationId: string | null
    hasAgent?: boolean
    pending?: boolean
    sending?: boolean
  }>(),
  { hasAgent: true },
)

const emit = defineEmits<{
  selectConversation: [id: string]
  send: [content: string]
  newConversation: []
}>()

const threadsOpen = ref(false)

function onSelectThread(id: string) {
  emit('selectConversation', id)
  threadsOpen.value = false
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]" data-testid="agent-chat">
    <UCard :ui="{ body: 'p-4' }" class="hidden lg:block">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-highlighted text-sm font-semibold">Threads</span>
          <UButton
            icon="i-lucide-plus"
            size="xs"
            variant="ghost"
            label="New"
            :disabled="!hasAgent"
            data-testid="chat-new-conversation"
            @click="emit('newConversation')"
          />
        </div>
      </template>
      <ConversationList
        :conversations="conversations"
        :selected-id="selectedConversationId"
        :disabled="!hasAgent"
        @select="emit('selectConversation', $event)"
      />
    </UCard>

    <UCard :ui="{ body: 'p-4 sm:p-6' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UButton
              class="lg:hidden"
              icon="i-lucide-panel-left"
              label="Threads"
              color="neutral"
              variant="soft"
              size="sm"
              :disabled="!hasAgent"
              data-testid="chat-threads-drawer-trigger"
              @click="threadsOpen = true"
            />
            <span class="text-highlighted font-semibold">Messages</span>
          </div>
          <UButton
            class="lg:hidden"
            icon="i-lucide-plus"
            label="New thread"
            size="xs"
            variant="ghost"
            :disabled="!hasAgent"
            @click="emit('newConversation')"
          />
        </div>
      </template>

      <UAlert
        v-if="!hasAgent"
        color="neutral"
        variant="soft"
        title="Select an agent"
        description="Choose an agent above to load threads and send messages."
        class="mb-4"
      />

      <div v-if="pending" class="flex max-h-[min(560px,55vh)] flex-col gap-3 overflow-hidden pr-1" aria-busy="true">
        <USkeleton v-for="n in 5" :key="n" class="h-14 rounded-lg" />
      </div>
      <ChatMessageList v-else :messages="messages" />

      <ChatComposer
        class="mt-4"
        :disabled="!hasAgent || sending"
        :sending="sending"
        @submit="emit('send', $event)"
      />
    </UCard>

    <USlideover
      v-model:open="threadsOpen"
      side="left"
      title="Threads"
      description="Pick a conversation"
      class="lg:hidden"
      :ui="{ content: 'max-w-[min(100vw,280px)]' }"
    >
      <template #body>
        <div class="flex flex-col gap-3 p-4">
          <UButton
            icon="i-lucide-plus"
            label="New conversation"
            block
            size="sm"
            :disabled="!hasAgent"
            @click="emit('newConversation'); threadsOpen = false"
          />
          <ConversationList
            :conversations="conversations"
            :selected-id="selectedConversationId"
            :disabled="!hasAgent"
            @select="onSelectThread"
          />
        </div>
      </template>
    </USlideover>
  </div>
</template>
