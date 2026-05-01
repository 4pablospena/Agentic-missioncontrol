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
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Chat
          </h1>
        </template>
        <p class="text-muted text-sm">
          Fase 4. WebSocket stub Nitro:
          <UKbd size="sm">
            /realtime
          </UKbd>
          .
          El bloque siguiente usa
          <UKbd size="sm">
            UChatTool
          </UKbd>
          como vista previa; luego se puede enlazar al stream real.
        </p>

        <div class="mt-6 space-y-3">
          <p class="text-dimmed text-xs font-medium uppercase tracking-wide">
            Vista previa · invocación de herramienta
          </p>
          <UChatTool
            :text="streaming ? 'Ejecutando comprobación' : 'Comprobación terminada'"
            suffix="mock · misión"
            :streaming="streaming"
            icon="i-lucide-terminal"
            variant="card"
            chevron="leading"
            class="max-w-xl"
          >
            <pre class="font-mono text-xs" v-text="toolOutput" />
          </UChatTool>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const streaming = ref(true)
const toolOutput = ref(`$ pnpm run lint

> eslint .

✔ Sin errores de lint.`)

let streamingTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  streamingTimer = setTimeout(() => {
    streaming.value = false
  }, 4000)
})

onUnmounted(() => {
  if (streamingTimer) clearTimeout(streamingTimer)
})
</script>
