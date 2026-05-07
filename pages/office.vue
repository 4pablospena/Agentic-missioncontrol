<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { public: publicConfig } = useRuntimeConfig()
const officeEnabled = computed(() => publicConfig.office3dEnabled === true)
const route = useRoute()
const { events } = useRealtimeEvents()
const { agents, isLoading, refresh } = useAgents({ events })
const webglSupported = ref(true)
const forceFallback = computed(() => route.query.fallback === '1')

onMounted(() => {
  webglSupported.value = typeof window !== 'undefined' && !!window.WebGLRenderingContext
  void refresh()
})
</script>

<template>
  <UDashboardPanel id="office">
    <template #header>
      <UDashboardNavbar title="Office 3D">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <CommonEmptyState
        v-if="!officeEnabled"
        title="Office 3D disabled"
        description="Enable NUXT_PUBLIC_OFFICE3D_ENABLED=true to expose the experimental office scene."
        icon="i-lucide-cuboid"
        tone="warning"
      />
      <div v-else class="flex flex-col gap-4">
        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <div class="flex items-center justify-between gap-3">
            <p class="text-highlighted text-sm font-semibold">
              OpenClaw office operations
            </p>
            <UButton
              icon="i-lucide-refresh-cw"
              label="Refresh agents"
              color="neutral"
              variant="outline"
              size="sm"
              :loading="isLoading"
              @click="refresh"
            />
          </div>
          <p class="text-muted mt-2 text-sm">
            3D command center with desks per agent, live status avatars and navigation hotspots.
          </p>
        </UCard>

        <CommonEmptyState
          v-if="!webglSupported || forceFallback"
          title="WebGL not available"
          description="Fallback mode active. Open this route in a WebGL-capable browser for the full 3D scene."
          icon="i-lucide-monitor-off"
          tone="warning"
        />

        <Office3dOfficeScene v-else :agents="agents" />

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4' }">
          <Office3dOfficeHotspots />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
