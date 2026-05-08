<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  tone?: 'default' | 'critical'
}>(), {
  subtitle: '',
  tone: 'default',
})
</script>

<template>
  <UCard class="panel-shell hud-panel rounded-xl" :class="tone === 'critical' ? 'hud-panel--critical' : ''" :ui="{ body: 'p-4 sm:p-5' }">
    <div class="mb-3">
      <p class="hud-panel__title text-xs uppercase tracking-[0.18em]">
        {{ title }}
      </p>
      <p v-if="subtitle" class="text-muted mt-1 text-sm">
        {{ subtitle }}
      </p>
    </div>
    <slot />
  </UCard>
</template>
