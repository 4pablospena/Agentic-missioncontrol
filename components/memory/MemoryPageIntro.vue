<script setup lang="ts">
const helpOpen = ref(false)
</script>

<template>
  <section class="flex flex-col gap-3 pb-2">
    <div class="page-toolbar flex flex-wrap items-start justify-between gap-3">
      <div class="max-w-2xl space-y-1.5">
        <p class="text-muted text-sm leading-snug">
          Busca en la memoria semántica, inyecta contexto manualmente o exporta/importa instantáneas JSON.
        </p>
        <p class="text-muted text-xs leading-snug">
          Pestañas: exploración (búsqueda + listado), inyección manual e historial de snapshots.
        </p>
      </div>
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        size="xs"
        icon="i-lucide-circle-help"
        :label="helpOpen ? 'Ocultar ayuda' : 'Cómo funciona'"
        :trailing-icon="helpOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="shrink-0 self-start"
        :aria-expanded="helpOpen"
        aria-controls="memory-intro-help"
        @click="helpOpen = !helpOpen"
      />
    </div>
    <div
      v-show="helpOpen"
      id="memory-intro-help"
      class="panel-shell rounded-lg border border-default/50 px-4 py-3"
    >
      <ul class="text-muted list-inside list-disc space-y-1.5 text-xs leading-relaxed">
        <li>
          La búsqueda semántica ordena por similitud coseno (límite de escaneo en servidor).
        </li>
        <li>
          Las instantáneas exportan el resultado filtrado actual como JSON reutilizable.
        </li>
        <li>
          Usa la pestaña <strong class="text-highlighted">Inject</strong> para añadir memoria sin pasar por el chat.
        </li>
      </ul>
    </div>
  </section>
</template>
