<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '~/models/task'

const props = defineProps<{
  status: TaskStatus
}>()

const color = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'success'
    case 'running':
      return 'info'
    case 'failed':
      return 'error'
    case 'cancelled':
      return 'neutral'
    case 'scheduled':
      return 'warning'
    default:
      return 'neutral'
  }
})

const label = computed(() => props.status.replace(/-/g, ' '))
</script>

<template>
  <UBadge :color="color" variant="subtle" class="capitalize">
    {{ label }}
  </UBadge>
</template>
