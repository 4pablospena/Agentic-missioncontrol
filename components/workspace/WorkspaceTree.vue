<script setup lang="ts">
import type { WorkspaceEntry, WorkspaceListing } from '~/models/workspace'

interface Props {
  listings: ReadonlyMap<string, WorkspaceListing>
  expanded: ReadonlySet<string>
  selectedPath: string | null
  loading: boolean
  errorStatus: number
  errorMessage: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle', path: string): void
  (e: 'open-file', path: string): void
  (e: 'reload-root'): void
}>()

const root = computed(() => props.listings.get('') ?? null)

interface DisplayedEntry extends WorkspaceEntry {
  depth: number
  isExpanded: boolean
}

function flattenChildren(parentPath: string, depth: number, acc: DisplayedEntry[]): void {
  const listing = props.listings.get(parentPath)
  if (!listing)
    return
  for (const entry of listing.entries) {
    const isExpanded = entry.kind === 'dir' && props.expanded.has(entry.path)
    acc.push({ ...entry, depth, isExpanded })
    if (isExpanded)
      flattenChildren(entry.path, depth + 1, acc)
  }
}

const flattened = computed<DisplayedEntry[]>(() => {
  const out: DisplayedEntry[] = []
  flattenChildren('', 0, out)
  return out
})

function onClick(entry: DisplayedEntry) {
  if (entry.kind === 'dir')
    emit('toggle', entry.path)
  else
    emit('open-file', entry.path)
}

function onKeydown(e: KeyboardEvent, entry: DisplayedEntry) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick(entry)
  }
}

function indentPx(depth: number): number {
  return 12 + depth * 14
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <header class="border-default flex items-center justify-between gap-2 border-b px-3 py-2">
      <p class="text-muted text-xs font-medium uppercase tracking-wide">
        Files
      </p>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        size="xs"
        :loading="loading"
        aria-label="Reload workspace tree"
        @click="emit('reload-root')"
      />
    </header>

    <UAlert
      v-if="errorStatus && errorStatus !== 503"
      color="error"
      variant="subtle"
      :title="errorMessage || 'Failed to load workspace'"
      class="m-3"
    />

    <CommonEmptyState
      v-else-if="loading && !root"
      loading
      title="Loading tree…"
      variant="compact"
    />

    <CommonEmptyState
      v-else-if="!root && !errorStatus"
      title="Workspace empty"
      description="The configured root has no readable entries."
      icon="i-lucide-folder"
      variant="compact"
    />

    <ul
      v-else
      role="tree"
      class="min-h-0 flex-1 overflow-y-auto py-1"
    >
      <li
        v-for="entry in flattened"
        :key="entry.path"
        role="treeitem"
        :aria-expanded="entry.kind === 'dir' ? entry.isExpanded : undefined"
        :aria-selected="selectedPath === entry.path"
        :tabindex="0"
        :class="[
          'group flex cursor-pointer items-center gap-1.5 py-1 text-sm focus:outline-none',
          selectedPath === entry.path
            ? 'bg-primary/10 text-highlighted'
            : 'hover:bg-elevated/40 text-default',
        ]"
        :style="{ paddingLeft: `${indentPx(entry.depth)}px`, paddingRight: '12px' }"
        @click="onClick(entry)"
        @keydown="onKeydown($event, entry)"
      >
        <UIcon
          v-if="entry.kind === 'dir'"
          :name="entry.isExpanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          class="text-dimmed size-3.5 shrink-0"
        />
        <span v-else class="inline-block w-3.5 shrink-0" />
        <UIcon
          :name="entry.kind === 'dir' ? (entry.isExpanded ? 'i-lucide-folder-open' : 'i-lucide-folder') : 'i-lucide-file'"
          :class="['size-3.5 shrink-0', entry.kind === 'dir' ? 'text-primary' : 'text-muted']"
        />
        <span class="truncate">{{ entry.name }}</span>
      </li>
    </ul>
  </div>
</template>
