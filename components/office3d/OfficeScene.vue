<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'

const props = defineProps<{
  agents: AgentSummary[]
}>()

const cameraX = ref(0)
const cameraZ = ref(0)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp')
    cameraZ.value -= 12
  if (event.key === 'ArrowDown')
    cameraZ.value += 12
  if (event.key === 'ArrowLeft')
    cameraX.value -= 12
  if (event.key === 'ArrowRight')
    cameraX.value += 12
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

const positionedAgents = computed(() =>
  props.agents.map((agent, index) => ({
    agent,
    x: (index % 4) * 120 + 20 - cameraX.value,
    z: Math.floor(index / 4) * 90 + 20 - cameraZ.value,
  })),
)
</script>

<template>
  <div class="office-scene panel-shell relative min-h-[420px] overflow-hidden rounded-xl p-4">
    <div class="office-floor absolute inset-0" />
    <div class="relative z-10">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-highlighted text-sm font-semibold">
          Office map
        </p>
        <p class="text-muted text-xs">
          Move camera: arrow keys
        </p>
      </div>
      <div class="relative h-[320px] rounded-lg border border-default/40 bg-black/20">
        <Office3dAgentDesk
          v-for="entry in positionedAgents"
          :key="entry.agent.id"
          :agent="entry.agent"
          :x="entry.x"
          :z="entry.z"
        />
        <Office3dAgentAvatar
          v-for="entry in positionedAgents"
          :key="`${entry.agent.id}-avatar`"
          :agent="entry.agent"
          :x="entry.x + 78"
          :z="entry.z + 8"
        />
      </div>
    </div>
  </div>
</template>
