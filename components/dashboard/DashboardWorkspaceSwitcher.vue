<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <UButton
    :label="collapsed ? undefined : 'Mission Control'"
    icon="i-lucide-orbit"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    class="data-[state=open]:bg-elevated"
    :class="[!collapsed && 'py-2']"
    :ui="{ trailingIcon: 'text-dimmed' }"
  />
</template>
