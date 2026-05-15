<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
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
  { label: 'Selecciona un agente…', value: '' },
  ...agents.value.map(a => ({ label: `${a.name} (${a.id})`, value: a.id })),
])

const hasAgent = computed(() => !!String(agentId.value ?? '').trim())

onMounted(async () => {
  await refreshAgents()
  const q = route.query.agentId
  if (typeof q === 'string' && q.trim())
    agentId.value = decodeURIComponent(q.trim())
})

async function onRefreshChat() {
  await refreshAgents()
  await refreshChat()
}
</script>

<template>
  <DashboardPageShell
    title="Chat"
    subtitle="Conversaciones con agentes vía bridge OpenClaw"
    icon="i-lucide-message-square"
    accent-color="pink"
  >
    <template #actions>
      <RetroButton
        color="pink"
        variant="ghost"
        size="sm"
        icon="i-lucide-rotate-ccw"
        :loading="pending"
        data-testid="chat-refresh"
        type="button"
        @click="onRefreshChat"
      >
        <span class="hidden sm:inline">Actualizar</span>
      </RetroButton>
    </template>

    <div class="flex flex-col gap-6">
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h1 class="text-highlighted font-semibold">
                Chat con agentes
              </h1>
              <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle">
                Tiempo real {{ connected ? 'conectado' : 'desconectado' }}
              </UBadge>
            </div>
          </template>

          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            title="Error de chat"
            :description="errorMsg"
            class="mb-4"
          />

          <UFormField label="Agente" class="max-w-md">
            <USelectMenu
              v-model="agentId"
              :items="agentMenuItems"
              value-key="value"
              label-key="label"
              placeholder="Selecciona un agente…"
              :search-input="false"
              class="w-full"
              data-testid="chat-agent-select"
            />
          </UFormField>

          <UCollapsible class="mt-3">
            <UButton
              class="group"
              label="Cómo funciona"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-chevron-down"
              :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
            />

            <template #content>
              <p class="text-muted text-sm">
                Usa el bridge OpenClaw (
                <UKbd size="sm">
                  OPENCLAW_BRIDGE_MODE
                </UKbd>
                ). En modo mock las respuestas incluyen tu mensaje y contadores de contexto; el gateway real se activa al configurarlo.
                Consulta la
                <ULink
                  to="https://docs.openclaw.ai/"
                  target="_blank"
                  class="text-primary font-medium underline"
                >
                  documentación de OpenClaw
                </ULink>
                para el gateway.
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
  </DashboardPageShell>
</template>
