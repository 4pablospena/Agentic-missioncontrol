<script setup lang="ts">
import { computed } from 'vue'

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
  refreshChat,
  sendMessage,
  selectConversation,
  startNewConversation,
} = useAgentChat({ events })

const agentMenuItems = computed(() => [
  { label: 'Select an agent…', value: '' },
  ...agents.value.map(a => ({ label: `${a.name} (${a.id})`, value: a.id })),
])

const hasAgent = computed(() => !!String(agentId.value ?? '').trim())

onMounted(async () => {
  await refreshAgents()
})

async function onRefreshChat() {
  await refreshAgents()
  await refreshChat()
}
</script>

<template>
  <UDashboardPanel id="chat">
    <template #header>
      <UDashboardNavbar title="Chat" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="pending"
            data-testid="chat-refresh"
            @click="onRefreshChat"
          />
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
            <USelectMenu
              v-model="agentId"
              :items="agentMenuItems"
              value-key="value"
              label-key="label"
              placeholder="Select an agent…"
              :search-input="false"
              class="w-full"
              data-testid="chat-agent-select"
            />
          </UFormField>

          <UCollapsible class="mt-3">
            <UButton
              class="group"
              label="How it works"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-chevron-down"
              :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
            />

            <template #content>
              <p class="text-muted text-sm">
                Uses the OpenClaw bridge (
                <UKbd size="sm">
                  OPENCLAW_BRIDGE_MODE
                </UKbd>
                ). Mock replies include your message and context counts; the gateway path stays a stub until wired.
                See
                <ULink
                  to="https://docs.openclaw.ai/"
                  target="_blank"
                  class="text-primary font-medium underline"
                >
                  OpenClaw docs
                </ULink>
                for gateway setup.
              </p>
            </template>
          </UCollapsible>
        </UCard>

        <AgentChat
          :has-agent="hasAgent"
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
