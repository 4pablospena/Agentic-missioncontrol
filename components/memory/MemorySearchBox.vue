<script setup lang="ts">
const query = defineModel<string>('query', { required: true })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
}>()
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
    <UFormField label="Semantic query" class="min-w-0 flex-1">
      <UInput
        v-model="query"
        placeholder="Describe what you are looking for…"
        data-testid="memory-search-input"
        @keydown.enter.prevent="emit('search')"
      />
    </UFormField>
    <UButton
      icon="i-lucide-search"
      label="Search"
      :loading="loading"
      data-testid="memory-search-submit"
      @click="emit('search')"
    />
  </div>
</template>
