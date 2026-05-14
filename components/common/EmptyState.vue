<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

/**
 * Shared empty / loading state. Replaces ad-hoc `<p>No items</p>` blocks scattered
 * across pages so wording, spacing and CTAs stop drifting between views.
 *
 * Usage:
 *   <CommonEmptyState title="No agents yet." description="Connect a worker to start." />
 *   <CommonEmptyState loading title="Loading agents…" />
 *   <CommonEmptyState
 *     title="No memory rows yet"
 *     description="Inject content from the Add tab."
 *     :cta="{ label: 'Go to Inject', icon: 'i-lucide-plus', onClick: focusInject }"
 *   />
 */
type CtaColor = NonNullable<ButtonProps['color']>

interface CtaConfig {
  label: string
  to?: string
  icon?: string
  onClick?: () => void
  color?: CtaColor
}

const props = withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
  cta?: CtaConfig
  /** When true: shows a loading spinner icon and dims the title. */
  loading?: boolean
  /**
   * Visual density. `inline` removes vertical padding so the component fits
   * inside table cells / list rows. `compact` is for tight cards.
   */
  variant?: 'default' | 'compact' | 'inline'
  /** Tone tints the icon. Errors should still use UAlert; tone is for nuance. */
  tone?: 'default' | 'warning' | 'error'
}>(), {
  description: undefined,
  icon: undefined,
  cta: undefined,
  loading: false,
  variant: 'default',
  tone: 'default',
})

const resolvedIcon = computed(() => {
  if (props.loading)
    return 'i-lucide-loader-2'
  if (props.icon)
    return props.icon
  if (props.tone === 'error')
    return 'i-lucide-octagon-alert'
  if (props.tone === 'warning')
    return 'i-lucide-triangle-alert'
  return 'i-lucide-inbox'
})

const iconToneClass = computed(() => {
  if (props.tone === 'error')
    return 'text-error'
  if (props.tone === 'warning')
    return 'text-warning'
  return 'text-muted'
})

const containerClass = computed(() => {
  if (props.variant === 'inline')
    return 'flex items-center gap-2 text-sm text-muted'
  if (props.variant === 'compact')
    return 'flex flex-col items-center gap-2 px-4 py-6 text-center'
  return 'flex flex-col items-center gap-3 px-6 py-10 text-center'
})
</script>

<template>
  <div :class="containerClass" role="status" aria-live="polite">
    <UIcon
      :name="resolvedIcon"
      :class="[
        iconToneClass,
        loading ? 'animate-spin' : '',
        variant === 'inline' ? 'size-4' : 'size-8 opacity-80',
      ]"
    />
    <div :class="variant === 'inline' ? '' : 'flex flex-col gap-1'">
      <p
        :class="[
          variant === 'inline' ? 'text-sm' : 'text-sm font-medium',
          loading ? 'text-muted' : 'text-highlighted',
        ]"
      >
        {{ title }}
      </p>
      <p v-if="description && variant !== 'inline'" class="text-muted max-w-prose text-xs">
        {{ description }}
      </p>
    </div>
    <UButton
      v-if="cta && !loading && variant !== 'inline'"
      :to="cta.to"
      :icon="cta.icon"
      :label="cta.label"
      :color="cta.color ?? 'neutral'"
      variant="outline"
      size="sm"
      class="mt-1"
      :type="cta.to ? undefined : 'button'"
      @click="cta.onClick?.()"
    />
  </div>
</template>
