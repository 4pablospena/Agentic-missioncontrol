<script setup lang="ts">
import { computed } from 'vue'
import type { NamedSeriesPoint } from '~/models/metric'

const props = defineProps<{
  series: NamedSeriesPoint[]
  /** Max bar width reference (largest value). */
  max?: number
}>()

const maxVal = computed(() => {
  if (props.max != null && props.max > 0)
    return props.max
  const peak = Math.max(0, ...props.series.map(s => s.value))
  return peak > 0 ? peak : 1
})
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="row in series"
      :key="row.label"
      class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
    >
      <span class="text-muted w-full truncate text-xs sm:w-40">{{ row.label }}</span>
      <div class="bg-muted h-2 flex-1 overflow-hidden rounded-full">
        <div
          class="bg-primary h-2 rounded-full transition-[width]"
          :style="{
            width: `${maxVal > 0 ? Math.min(100, (row.value / maxVal) * 100) : 0}%`,
          }"
        />
      </div>
      <span class="text-highlighted w-14 text-right text-xs tabular-nums">{{ row.value }}</span>
    </div>
    <p v-if="!series.length" class="text-muted text-sm">
      No token data.
    </p>
  </div>
</template>
