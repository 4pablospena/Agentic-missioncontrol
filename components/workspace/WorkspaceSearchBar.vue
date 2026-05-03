<script setup lang="ts">
import type { WorkspaceSearchResult } from '~/models/workspace'

interface Props {
  query: string
  scopePath: string
  result: WorkspaceSearchResult | null
  loading: boolean
  errorMessage: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:query', q: string): void
  (e: 'open-hit', payload: { path: string, line: number }): void
  (e: 'clear'): void
}>()

function onInput(value: string) {
  emit('update:query', value)
}

const hasQuery = computed(() => props.query.trim().length > 0)

const summary = computed(() => {
  if (props.loading)
    return 'Searching…'
  if (!props.result || !hasQuery.value)
    return ''
  const hits = props.result.hits.length
  const files = props.result.filesScanned
  const more = props.result.truncated ? ' (truncated)' : ''
  return `${hits} hit${hits === 1 ? '' : 's'} in ${files} file${files === 1 ? '' : 's'}${more}`
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <UFormField :label="`Search${scopePath ? ` in ${scopePath}` : ''}`" class="flex-1">
      <div class="flex items-center gap-2">
        <UInput
          :model-value="query"
          icon="i-lucide-search"
          placeholder="Type to search file contents…"
          class="flex-1"
          autocomplete="off"
          aria-label="Search workspace files"
          @update:model-value="onInput($event as string)"
        />
        <UButton
          v-if="hasQuery"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          aria-label="Clear search"
          @click="emit('clear')"
        />
      </div>
    </UFormField>

    <p v-if="summary" class="text-muted text-xs">
      {{ summary }}
    </p>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :title="errorMessage"
    />

    <ul
      v-if="result && result.hits.length > 0 && !loading"
      class="panel-shell divide-default max-h-72 divide-y overflow-y-auto rounded-lg"
    >
      <li
        v-for="hit in result.hits"
        :key="`${hit.path}:${hit.line}:${hit.column}`"
        class="hover:bg-elevated/40 flex cursor-pointer flex-col gap-0.5 px-3 py-2 text-xs transition-colors"
        @click="emit('open-hit', { path: hit.path, line: hit.line })"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-highlighted truncate font-medium">{{ hit.path }}</span>
          <span class="text-dimmed shrink-0 tabular-nums">L{{ hit.line }}:{{ hit.column }}</span>
        </div>
        <span class="text-muted font-metric truncate">{{ hit.snippet }}</span>
      </li>
    </ul>

    <CommonEmptyState
      v-else-if="hasQuery && !loading && result && result.hits.length === 0 && !errorMessage"
      title="No matches"
      :description="`No file contained “${query}” within ${result.filesScanned} scanned file${result.filesScanned === 1 ? '' : 's'}.`"
      icon="i-lucide-search-x"
      variant="compact"
    />
  </div>
</template>
