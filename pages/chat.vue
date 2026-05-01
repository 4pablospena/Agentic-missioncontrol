<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { events, connected } = useRealtimeEvents()
const { agents, refresh: refreshAgents } = useAgents({ events })

const {
  agentId,
  conversations,
  messages,
  selectedConversationId,
  pending,
  sending,
  errorMsg,
  sendMessage,
  selectConversation,
  startNewConversation,
} = useAgentChat({ events })

onMounted(async () => {
  await refreshAgents()
})
</script>

<template>
  <UDashboardPanel id="chat">
    <template #header>
      <UDashboardNavbar title="Chat" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h1 class="text-highlighted font-semibold">
                Agent chat
              </h1>
              <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle">
                Realtime {{ connected ? 'connected' : 'disconnected' }}
              </UBadge>
            </div>
          </template>

          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            title="Chat error"
            :description="errorMsg"
            class="mb-4"
          />

          <UFormField label="Agent" class="max-w-md">
            <select
              v-model="agentId"
              class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
              data-testid="chat-agent-select"
            >
              <option value="">
                Select an agent…
              </option>
              <option
                v-for="a in agents"
                :key="a.id"
                :value="a.id"
              >
                {{ a.name }} ({{ a.id }})
              </option>
            </select>
          </UFormField>

          <p class="text-muted mt-3 text-sm">
            Uses the OpenClaw bridge (
            <UKbd size="sm">
              OPENCLAW_BRIDGE_MODE
            </UKbd>
            ). Mock replies include your message and context counts; the gateway path stays a stub until wired.
          </p>
        </UCard>

        <AgentChat
          :conversations="conversations"
          :messages="messages"
          :selected-conversation-id="selectedConversationId"
          :pending="pending"
          :sending="sending"
          @select-conversation="selectConversation"
          @send="sendMessage"
          @new-conversation="startNewConversation"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
