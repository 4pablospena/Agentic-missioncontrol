<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <!-- Shares sidebar header row with notifications; grows when expanded, full-width when collapsed column -->
  <UButton
    :label="collapsed ? undefined : 'Mission Control'"
    icon="i-lucide-orbit"
    color="neutral"
    variant="ghost"
    :block="collapsed"
    :square="collapsed"
    class="data-[state=open]:bg-elevated"
    :class="[
      collapsed ? 'w-full py-2' : 'min-w-0 flex-1 basis-0 justify-start py-2',
    ]"
    :ui="{ trailingIcon: 'text-dimmed' }"
  />
</template>
