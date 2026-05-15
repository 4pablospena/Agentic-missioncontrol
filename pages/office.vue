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
  <DashboardPageShell
    title="Office 3D"
    subtitle="Centro de mando 3D experimental por agente"
    icon="i-lucide-box"
    accent-color="purple"
  >
      <CommonEmptyState
        v-if="!officeEnabled"
        title="Office 3D desactivado"
        description="Activa NUXT_PUBLIC_OFFICE3D_ENABLED=true para mostrar la escena experimental."
        icon="i-lucide-cuboid"
        tone="warning"
      />
      <div v-else class="flex flex-col gap-4">
        <UiHudPanel title="Vista bridge" subtitle="Mapa de oficina en vivo y accesos rápidos">
          <div class="flex items-center justify-between gap-3">
            <p class="text-highlighted text-sm font-semibold">
              Operaciones de oficina OpenClaw
            </p>
            <RetroButton
              color="purple"
              variant="outline"
              size="sm"
              icon="i-lucide-rotate-ccw"
              :loading="isLoading"
              type="button"
              @click="refresh"
            >
              Actualizar agentes
            </RetroButton>
          </div>
          <p class="text-muted mt-2 text-sm">
            Centro 3D con escritorios por agente, avatares de estado y puntos de navegación.
          </p>
        </UiHudPanel>

        <CommonEmptyState
          v-if="!webglSupported || forceFallback"
          title="WebGL no disponible"
          description="Modo alternativo activo. Abre esta ruta en un navegador con WebGL para la escena completa."
          icon="i-lucide-monitor-off"
          tone="warning"
        />

        <ClientOnly v-else>
          <Office3dOfficeScene :agents="agents" />
          <template #fallback>
            <div class="text-muted flex min-h-[200px] items-center justify-center text-sm">
              Cargando escena 3D…
            </div>
          </template>
        </ClientOnly>

        <UiHudPanel title="Hotspots" subtitle="Rutas rápidas a módulos tácticos">
          <Office3dOfficeHotspots />
        </UiHudPanel>
      </div>
  </DashboardPageShell>
</template>
