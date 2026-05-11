<script setup lang="ts">
import { buildAgentRoster } from '~/composables/useAgentRoster'

definePageMeta({ layout: 'dashboard' })

const { events } = useRealtimeEvents()
const { agents, error, isLoading, refresh } = useAgents({ events })
const redirected = ref(false)

watch(
  [agents, isLoading],
  async () => {
    if (isLoading.value)
      return
    const roster = buildAgentRoster(agents.value)
    if (roster.length === 0)
      return
    if (redirected.value)
      return
    redirected.value = true
    await navigateTo(`/agents/${encodeURIComponent(roster[0].agentKey)}`, { replace: true })
  },
  { immediate: true },
)

onMounted(() => void refresh())
</script>

<template>
  <div class="rs-canvas flex flex-col h-full overflow-auto">
    <RetroPageHeader
      title="Tu escuadrón"
      subtitle="Selecciona un agente en el panel lateral"
      icon="i-lucide-users"
      accent-color="purple"
    >
      <template #actions>
        <RetroButton
          color="cyan"
          variant="outline"
          size="sm"
          icon="i-lucide-rotate-ccw"
          :loading="isLoading"
          @click="refresh"
        >
          <span class="hidden sm:inline">Actualizar</span>
        </RetroButton>
      </template>
    </RetroPageHeader>

    <div class="rs-page">
      <RetroCard v-if="error" color="red" static class="px-4 py-3">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-triangle-alert" class="size-5 shrink-0 rs-glow-red" />
          <p class="rs-body rs-glow-red" style="font-size: 0.95rem;">{{ error }}</p>
        </div>
      </RetroCard>

      <div v-if="isLoading && agents.length === 0" class="flex justify-center py-16">
        <div class="rs-skeleton h-48 w-full max-w-md rounded-lg" />
      </div>

      <RetroEmptyState
        v-else-if="!isLoading && buildAgentRoster(agents).length === 0"
        title="Sin señal"
        description="Conecta Openclaw y activa Tailscale para ver tus agentes."
        icon="i-lucide-radio-tower"
        color="purple"
      />
    </div>
  </div>
</template>

<style scoped>
.rs-page {
  flex: 1;
  width: 100%;
  max-width: var(--rs-content-max);
  margin: 0 auto;
  padding: 1.5rem var(--rs-page-px) 3rem;
}
</style>
