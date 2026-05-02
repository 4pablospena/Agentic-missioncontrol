<script setup lang="ts">
import type { Conversation } from '~/models/chat'

withDefaults(
  defineProps<{
    conversations: Conversation[]
    selectedId: string | null
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1" data-testid="conversation-list">
    <UButton
      v-for="c in conversations"
      :key="c.id"
      :color="selectedId === c.id ? 'primary' : 'neutral'"
      :variant="selectedId === c.id ? 'soft' : 'ghost'"
      class="h-auto justify-start py-2"
      :disabled="disabled"
      @click="emit('select', c.id)"
    >
      <div class="flex w-full flex-col items-start gap-0.5 text-left">
        <span class="w-full truncate">{{ c.title }}</span>
        <span class="text-dimmed text-xs">{{ c.updatedAt.slice(0, 10) }}</span>
      </div>
    </UButton>
    <CommonEmptyState
      v-if="!conversations.length"
      title="No conversations yet."
      description="Pick an agent and start a thread to see it here."
      icon="i-lucide-message-square"
      variant="compact"
    />
  </div>
</template>
