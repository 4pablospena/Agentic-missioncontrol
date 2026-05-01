<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  exportPending?: boolean
  importPending?: boolean
}>()

const emit = defineEmits<{
  export: []
  importRaw: [json: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function openPicker() {
  fileInput.value?.click()
}

async function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return
  try {
    const text = await file.text()
    emit('importRaw', text)
  }
  finally {
    input.value = ''
  }
}
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-6' }">
    <template #header>
      <span class="text-highlighted font-semibold">Snapshots</span>
    </template>
    <p class="text-muted mb-4 text-sm">
      Export respects the same agent/date filters as the list. Import expects JSON:
      <code class="font-mono text-xs">snapshotVersion</code>
      +
      <code class="font-mono text-xs">items[]</code>.
    </p>
    <div class="flex flex-wrap gap-2">
      <UButton
        icon="i-lucide-download"
        label="Export snapshot"
        :loading="exportPending"
        data-testid="snapshot-export"
        @click="emit('export')"
      />
      <UButton
        icon="i-lucide-upload"
        label="Import JSON…"
        color="neutral"
        variant="outline"
        :loading="importPending"
        data-testid="snapshot-import-trigger"
        @click="openPicker"
      />
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        data-testid="snapshot-import-input"
        @change="onFileChange"
      />
    </div>
  </UCard>
</template>
