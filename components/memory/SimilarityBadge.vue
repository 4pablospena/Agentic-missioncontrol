<script setup lang="ts">
import { formatSimilarityScore } from '~/utils/formatSimilarity'

const props = defineProps<{
  similarity: number
}>()
</script>

<template>
  <UBadge color="primary" variant="subtle" size="sm" data-testid="memory-similarity-badge">
    {{ formatSimilarityScore(props.similarity) }}
  </UBadge>
</template>
