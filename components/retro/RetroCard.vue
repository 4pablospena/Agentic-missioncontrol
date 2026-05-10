<script setup lang="ts">
type RetroColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red' | 'indigo' | 'neutral'

const props = withDefaults(
  defineProps<{
    color?: RetroColor
    active?: boolean
    /** Show subtle corner brackets accent */
    brackets?: boolean
    /** Disable hover lift */
    static?: boolean
    /** Make the card act as a button */
    interactive?: boolean
  }>(),
  {
    color: 'neutral',
    active: false,
    brackets: false,
    static: false,
    interactive: false,
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
    neutral: 'var(--rs-text-muted)',
  }
  return map[props.color]
})
</script>

<template>
  <div
    class="rs-card"
    :class="[
      { 'rs-card--active': active, 'rs-card--interactive': interactive, 'rs-card--static': static, 'rs-card--brackets': brackets },
    ]"
    :style="{ '--card-color': colorVar }"
  >
    <slot />
  </div>
</template>

<style scoped>
.rs-card {
  position: relative;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--rs-surface) 85%, var(--card-color) 4%) 0%,
    var(--rs-surface) 100%
  );
  border: 1px solid var(--rs-border);
  border-radius: var(--rs-radius-lg);
  box-shadow: var(--rs-shadow-sm);
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    transform 150ms ease,
    background 200ms ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Top highlight stripe (subtle) */
.rs-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--card-color) 40%, transparent), transparent);
  opacity: 0.5;
  pointer-events: none;
}

.rs-card--interactive { cursor: pointer; }

.rs-card--interactive:hover {
  border-color: color-mix(in srgb, var(--card-color) 50%, var(--rs-border-hi));
  box-shadow:
    var(--rs-shadow),
    0 0 0 1px color-mix(in srgb, var(--card-color) 30%, transparent),
    0 8px 24px color-mix(in srgb, var(--card-color) 12%, transparent);
}

.rs-card--interactive:not(.rs-card--static):hover { transform: translateY(-2px); }

.rs-card--active {
  border-color: color-mix(in srgb, var(--card-color) 60%, var(--rs-border-hi));
  box-shadow:
    var(--rs-shadow),
    0 0 0 1px color-mix(in srgb, var(--card-color) 35%, transparent),
    0 0 32px color-mix(in srgb, var(--card-color) 18%, transparent);
}

.rs-card--active::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 80% 30% at 50% 0%,
    color-mix(in srgb, var(--card-color) 10%, transparent) 0%,
    transparent 100%
  );
  border-radius: inherit;
}
</style>
