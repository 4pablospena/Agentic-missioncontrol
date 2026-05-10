<script setup lang="ts">
type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

const props = withDefaults(
  defineProps<{
    color?: RetroColor
    label?: string
    size?: 'sm' | 'md'
    pulse?: boolean
  }>(),
  {
    color: 'cyan',
    size: 'sm',
    pulse: false,
  },
)

const colorVar = computed(() => {
  const map: Record<RetroColor, string> = {
    pink:    'var(--rs-pink)',
    cyan:    'var(--rs-cyan)',
    purple:  'var(--rs-purple)',
    indigo:  'var(--rs-indigo)',
    yellow:  'var(--rs-yellow)',
    orange:  'var(--rs-orange)',
    green:   'var(--rs-green)',
    red:     'var(--rs-red)',
    neutral: 'var(--rs-text-dim)',
  }
  return map[props.color]
})
</script>

<template>
  <span
    class="rs-badge"
    :class="[`rs-badge--${size}`]"
    :style="{ '--badge-color': colorVar }"
  >
    <span v-if="pulse" class="rs-dot" :style="{ background: colorVar }" />
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.rs-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--rs-font-body);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--badge-color) 75%, white 15%);
  border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
  background: color-mix(in srgb, var(--badge-color) 12%, rgba(0, 0, 0, 0.25));
  border-radius: 999px;
  white-space: nowrap;
  line-height: 1;
  flex-shrink: 0;
  width: fit-content;
}

.rs-badge--sm { font-size: var(--rs-text-2xs); padding: 0.3rem 0.65rem; min-height: 22px; }
.rs-badge--md { font-size: var(--rs-text-xs);  padding: 0.4rem 0.8rem;  min-height: 26px; }
</style>
