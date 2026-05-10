<script setup lang="ts">
type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'
type RetroVariant = 'neon' | 'terminal' | 'bubble' | 'ticket'
type RetroSize = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: RetroVariant
    color?: RetroColor
    size?: RetroSize
    label?: string
    icon?: string
    cursor?: boolean
  }>(),
  {
    variant: 'neon',
    color: 'cyan',
    size: 'sm',
    cursor: false,
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
    class="rs-tag"
    :class="[`rs-tag--${variant}`, `rs-tag--${size}`]"
    :style="{ '--tag-color': colorVar }"
  >
    <UIcon v-if="icon" :name="icon" class="rs-tag__icon" />
    <span class="rs-tag__label"><slot>{{ label }}</slot></span>
    <span v-if="cursor" class="rs-tag__cursor">_</span>
  </span>
</template>

<style scoped>
.rs-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  line-height: 1;
  flex-shrink: 0;
  width: fit-content;
}

.rs-tag__icon { width: 1em; height: 1em; flex-shrink: 0; }

.rs-tag__cursor {
  display: inline-block;
  margin-left: 1px;
  animation: rs-blink 1s step-end infinite;
}

/* ─── NEON — soft glow border, modern radius ─── */
.rs-tag--neon {
  font-family: var(--rs-font-body);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--tag-color) 80%, white 10%);
  background: color-mix(in srgb, var(--tag-color) 10%, rgba(0, 0, 0, 0.25));
  border: 1px solid color-mix(in srgb, var(--tag-color) 35%, transparent);
  border-radius: var(--rs-radius-sm);
  box-shadow: 0 0 8px color-mix(in srgb, var(--tag-color) 12%, transparent);
}

.rs-tag--neon.rs-tag--sm { font-size: var(--rs-text-2xs); padding: 0.25rem 0.55rem; min-height: 22px; }
.rs-tag--neon.rs-tag--md { font-size: var(--rs-text-xs);  padding: 0.35rem 0.7rem;  min-height: 26px; }

/* ─── TERMINAL — phosphor mono, prefix > ─── */
.rs-tag--terminal {
  font-family: var(--rs-font-mono);
  font-weight: 500;
  color: color-mix(in srgb, var(--tag-color) 75%, white 10%);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid color-mix(in srgb, var(--tag-color) 25%, transparent);
  border-radius: var(--rs-radius-sm);
}

.rs-tag--terminal.rs-tag--sm { font-size: var(--rs-text-2xs); padding: 0.25rem 0.5rem; min-height: 22px; }
.rs-tag--terminal.rs-tag--md { font-size: var(--rs-text-xs);  padding: 0.3rem 0.65rem; min-height: 26px; }

.rs-tag--terminal::before {
  content: '#';
  opacity: 0.45;
  margin-right: 1px;
  font-weight: 600;
}

/* ─── BUBBLE — pill, soft elevation ─── */
.rs-tag--bubble {
  font-family: var(--rs-font-body);
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--tag-color) 95%, white 5%) 0%,
    var(--tag-color) 100%);
  border: 1px solid color-mix(in srgb, var(--tag-color) 90%, black 15%);
  border-radius: 999px;
  letter-spacing: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 2px 8px color-mix(in srgb, var(--tag-color) 25%, transparent);
}

.rs-tag--bubble.rs-tag--sm { font-size: var(--rs-text-2xs); padding: 0.25rem 0.7rem;  min-height: 22px; }
.rs-tag--bubble.rs-tag--md { font-size: var(--rs-text-xs);  padding: 0.35rem 0.85rem; min-height: 26px; }

/* ─── TICKET — solid uppercase, refined ─── */
.rs-tag--ticket {
  font-family: var(--rs-font-display);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: white;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--tag-color) 88%, white 4%) 0%,
    color-mix(in srgb, var(--tag-color) 95%, black 6%) 100%
  );
  border: 1px solid color-mix(in srgb, var(--tag-color) 95%, black 15%);
  border-radius: var(--rs-radius-sm);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 1px 3px rgba(0, 0, 0, 0.35);
}

.rs-tag--ticket.rs-tag--sm { font-size: var(--rs-text-2xs); padding: 0.3rem 0.65rem; min-height: 22px; }
.rs-tag--ticket.rs-tag--md { font-size: var(--rs-text-xs);  padding: 0.4rem 0.8rem;  min-height: 26px; }
</style>
