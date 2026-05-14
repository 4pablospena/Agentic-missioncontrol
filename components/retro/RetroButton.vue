<script setup lang="ts">
import { mergeProps, resolveComponent, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'
type RetroSize = 'sm' | 'md' | 'lg'
type RetroVariant = 'solid' | 'outline' | 'ghost'

const props = withDefaults(
  defineProps<{
    color?: RetroColor
    size?: RetroSize
    variant?: RetroVariant
    icon?: string
    trailingIcon?: string
    label?: string
    block?: boolean
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    to?: string
  }>(),
  {
    color: 'indigo',
    size: 'md',
    variant: 'solid',
    block: false,
    loading: false,
    disabled: false,
    type: 'button',
  },
)

const attrs = useAttrs()

const colorVar = computed(() => {
  const map: Record<RetroColor, string> = {
    pink: 'var(--rs-pink)',
    cyan: 'var(--rs-cyan)',
    purple: 'var(--rs-purple)',
    indigo: 'var(--rs-indigo)',
    yellow: 'var(--rs-yellow)',
    orange: 'var(--rs-orange)',
    green: 'var(--rs-green)',
    red: 'var(--rs-red)',
    neutral: 'var(--rs-text-muted)',
  }
  return map[props.color]
})

const NuxtLink = resolveComponent('NuxtLink')

const rootIs = computed(() => {
  if (props.to) {
    if (props.disabled || props.loading)
      return 'span'
    return NuxtLink
  }
  return 'button'
})

const rootBind = computed(() => {
  const cls = [
    'rs-btn',
    `rs-btn--${props.size}`,
    `rs-btn--${props.variant}`,
    props.block && 'rs-btn--block',
    (props.disabled || props.loading) && props.to && 'rs-btn--link-disabled',
  ].filter(Boolean)

  const own = {
    class: cls,
    style: { '--btn-color': colorVar.value },
  }

  if (props.to) {
    if (props.disabled || props.loading) {
      return mergeProps(attrs, own, {
        role: 'link' as const,
        'aria-disabled': true,
        tabindex: -1,
      })
    }
    return mergeProps(attrs, own, { to: props.to })
  }

  return mergeProps(attrs, own, {
    type: props.type,
    disabled: props.disabled || props.loading,
  })
})
</script>

<template>
  <component :is="rootIs" v-bind="rootBind">
    <UIcon
      v-if="loading"
      name="i-lucide-loader-circle"
      class="rs-btn__icon rs-btn__icon--spin"
    />
    <UIcon
      v-else-if="icon"
      :name="icon"
      class="rs-btn__icon"
    />
    <span v-if="label || $slots.default" class="rs-btn__label">
      <slot>{{ label }}</slot>
    </span>
    <UIcon
      v-if="trailingIcon && !loading"
      :name="trailingIcon"
      class="rs-btn__icon"
    />
  </component>
</template>

<style scoped>
.rs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--rs-font-body);
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  border-radius: var(--rs-radius);
  white-space: nowrap;
  user-select: none;
  position: relative;
  text-decoration: none;
  line-height: 1;
}

.rs-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rs-btn--link-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.rs-btn--block { width: 100%; }

.rs-btn--sm  { padding: 0.45rem 0.75rem; font-size: var(--rs-text-md);  min-height: 32px; }
.rs-btn--md  { padding: 0.6rem 1rem;     font-size: var(--rs-text-md);  min-height: 38px; }
.rs-btn--lg  { padding: 0.75rem 1.25rem; font-size: var(--rs-text-base);min-height: 46px; }

.rs-btn__icon { flex-shrink: 0; width: 1.05em; height: 1.05em; }
.rs-btn__icon--spin { animation: rs-spin 1s linear infinite; }
@keyframes rs-spin { to { transform: rotate(360deg); } }

.rs-btn--solid {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--btn-color) 92%, white 8%) 0%,
    var(--btn-color) 100%
  );
  color: white;
  border-color: color-mix(in srgb, var(--btn-color) 85%, black 15%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 0 16px color-mix(in srgb, var(--btn-color) 25%, transparent);
}

.rs-btn--solid:not(:disabled):not(.rs-btn--link-disabled):hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 4px 12px rgba(0, 0, 0, 0.5),
    0 0 24px color-mix(in srgb, var(--btn-color) 50%, transparent);
  transform: translateY(-1px);
}

.rs-btn--solid:not(:disabled):not(.rs-btn--link-disabled):active { transform: translateY(0); }

.rs-btn--outline {
  background: color-mix(in srgb, var(--btn-color) 4%, rgba(0, 0, 0, 0.2));
  color: var(--btn-color);
  border-color: color-mix(in srgb, var(--btn-color) 35%, var(--rs-border));
}

.rs-btn--outline:not(:disabled):not(.rs-btn--link-disabled):hover {
  background: color-mix(in srgb, var(--btn-color) 12%, rgba(0, 0, 0, 0.2));
  border-color: color-mix(in srgb, var(--btn-color) 60%, var(--rs-border));
  box-shadow: 0 0 12px color-mix(in srgb, var(--btn-color) 20%, transparent);
}

.rs-btn--ghost {
  background: transparent;
  color: var(--btn-color);
  border-color: transparent;
}

.rs-btn--ghost:not(:disabled):not(.rs-btn--link-disabled):hover {
  background: color-mix(in srgb, var(--btn-color) 10%, transparent);
}
</style>
