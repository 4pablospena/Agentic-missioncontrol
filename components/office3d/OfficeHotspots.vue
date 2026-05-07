<script setup lang="ts">
const hotspots = [
  { label: 'Monitoring', to: '/monitoring' },
  { label: 'Scheduler', to: '/scheduler' },
  { label: 'Agents', to: '/agents' },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      v-for="hotspot in hotspots"
      :key="hotspot.to"
      :to="hotspot.to"
      size="xs"
      color="neutral"
      variant="outline"
      :label="hotspot.label"
      trailing-icon="i-lucide-arrow-up-right"
    />
  </div>
</template>
