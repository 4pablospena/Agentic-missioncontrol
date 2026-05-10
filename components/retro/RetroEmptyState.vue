<script setup lang="ts">
type RetroColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
    color?: RetroColor
  }>(),
  {
    icon: 'i-lucide-zap-off',
    color: 'purple',
  },
)

const colorVar = computed(() => `var(--rs-${props.color === 'neutral' ? 'text-dim' : props.color})`)
</script>

<template>
  <div class="rs-empty">
    <UIcon
      :name="icon"
      class="rs-empty__icon"
      :style="{ color: colorVar, filter: `drop-shadow(0 0 16px ${colorVar})` }"
    />
    <p class="rs-display rs-empty__title" :style="{ color: colorVar, textShadow: `0 0 10px ${colorVar}` }">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="rs-body rs-empty__description"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<style scoped>
.rs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  border: 1px dashed var(--rs-border);
  background: color-mix(in srgb, var(--rs-surface) 50%, transparent);
}

.rs-empty__icon {
  width: 2.5rem;
  height: 2.5rem;
}

@media (min-width: 640px) {
  .rs-empty__icon { width: 3rem; height: 3rem; }
}

.rs-empty__title {
  font-size: var(--rs-text-md);
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

@media (min-width: 640px) {
  .rs-empty__title { font-size: var(--rs-text-lg); }
}

.rs-empty__description {
  font-size: var(--rs-text-md);
  color: var(--rs-text-muted);
  max-width: 28rem;
  line-height: 1.5;
}
</style>
