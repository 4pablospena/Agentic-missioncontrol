<script setup lang="ts">
import { computed } from 'vue'
import type { MemoryItem, SemanticSearchResult } from '~/models/memory'
import MemoryContextPreview from './ContextPreview.vue'
import MemorySimilarityBadge from './SimilarityBadge.vue'

const props = defineProps<{
  variant: 'list' | 'search'
  item: MemoryItem
  result?: SemanticSearchResult
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const preview = computed(() => {
  const text = props.item.content
  return text.length > 400 ? `${text.slice(0, 397)}…` : text
})
</script>

<template>
  <UCard :ui="{ body: 'p-4' }" data-testid="memory-result-card">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge variant="subtle" color="neutral">
          {{ item.source }}
        </UBadge>
        <span class="text-dimmed font-mono text-xs">{{ item.agentId }}</span>
        <span class="text-dimmed text-xs">{{ item.createdAt }}</span>
      </div>
      <div class="flex items-center gap-2">
        <MemorySimilarityBadge v-if="variant === 'search' && result" :similarity="result.similarity" />
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          data-testid="memory-delete-button"
          @click="emit('delete', item.id)"
        />
      </div>
    </div>
    <p class="text-highlighted mt-3 whitespace-pre-wrap text-sm">
      {{ preview }}
    </p>
    <MemoryContextPreview
      v-if="variant === 'search' && result?.matchedContext && result.matchedContext !== item.content"
      :text="result.matchedContext"
    />
  </UCard>
</template>
