<script setup lang="ts">
import type { WorkspaceFile } from '~/models/workspace'
import { formatBytes } from '~/utils/formatBytes'
import { formatIso } from '~/utils/formatDate'

interface Props {
  file: WorkspaceFile | null
  loading: boolean
  errorStatus: number
  errorMessage: string
  selectedPath: string | null
  /** Optional 1-indexed line to highlight & scroll into view. */
  highlightLine?: number | null
}

const props = defineProps<Props>()

const toast = useToast()

async function copyPath() {
  if (!props.file)
    return
  try {
    await navigator.clipboard.writeText(props.file.path)
    toast.add({ title: 'Path copied', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({ title: 'Could not copy path', color: 'error', icon: 'i-lucide-x' })
  }
}

const numberedLines = computed(() => {
  if (!props.file)
    return []
  return props.file.content.split(/\r?\n/)
})

const codeRef = ref<HTMLElement | null>(null)

watch(
  () => [props.file?.path, props.highlightLine] as const,
  async ([, line]) => {
    await nextTick()
    if (!line || !codeRef.value)
      return
    const target = codeRef.value.querySelector<HTMLElement>(`[data-line="${line}"]`)
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  },
)
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <header
      v-if="file || selectedPath || errorStatus"
      class="border-default flex items-center justify-between gap-3 border-b px-4 py-2"
    >
      <div class="min-w-0 flex flex-col">
        <p class="text-highlighted truncate text-sm font-medium">
          {{ file?.path ?? selectedPath }}
        </p>
        <p v-if="file" class="text-muted truncate text-xs">
          {{ formatBytes(file.size) }} · {{ formatIso(file.mtime) }}{{ file.truncated ? ' · truncated' : '' }}
        </p>
      </div>
      <UButton
        v-if="file"
        icon="i-lucide-copy"
        color="neutral"
        variant="ghost"
        size="xs"
        aria-label="Copy file path"
        @click="copyPath"
      />
    </header>

    <UAlert
      v-if="errorStatus"
      color="error"
      variant="subtle"
      :title="errorMessage || 'Failed to load file'"
      class="m-3"
    />

    <CommonEmptyState
      v-else-if="loading"
      loading
      title="Loading file…"
      variant="compact"
    />

    <CommonEmptyState
      v-else-if="!file"
      title="No file selected"
      description="Pick a file from the tree on the left to preview its contents."
      icon="i-lucide-file"
      variant="compact"
    />

    <pre
      v-else
      ref="codeRef"
      class="font-metric min-h-0 flex-1 overflow-auto bg-transparent p-4 text-[12px] leading-5"
    ><code class="block whitespace-pre"><span
      v-for="(line, idx) in numberedLines"
      :key="idx"
      :data-line="idx + 1"
      :class="[
        'flex w-full',
        highlightLine && (idx + 1) === highlightLine ? 'bg-primary/10' : '',
      ]"
    ><span class="text-dimmed inline-block w-10 select-none pr-3 text-right tabular-nums">{{ idx + 1 }}</span><span class="flex-1">{{ line || ' ' }}</span></span></code></pre>
  </div>
</template>
