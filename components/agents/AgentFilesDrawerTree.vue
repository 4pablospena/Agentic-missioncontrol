<script setup lang="ts">
import type { AgentFile, TierMeta } from '~/config/agent-files-mock'
import { agentFileTierColor } from '~/composables/useAgentFilesDrawerState'

defineProps<{
  tiers: TierMeta[]
  filesByTier: Record<string, AgentFile[]>
  selectedPath: string
  dirtyPaths: Set<string>
}>()

const emit = defineEmits<{
  select: [path: string]
}>()
</script>

<template>
  <aside class="rs-drawer__tree">
    <div
      v-for="tier in tiers"
      :key="tier.id"
      class="rs-tree__group"
    >
      <div class="rs-tree__group-header">
        <span
          class="rs-tree__tier-badge"
          :class="`rs-glow-${agentFileTierColor(tier.id)}`"
        >
          {{ tier.id }}
        </span>
        <span class="rs-tree__group-label">
          {{ tier.label }}
        </span>
      </div>

      <button
        v-for="file in filesByTier[tier.id]"
        :key="file.path"
        type="button"
        class="rs-tree__item"
        :class="{ 'rs-tree__item--active': selectedPath === file.path }"
        @click="emit('select', file.path)"
      >
        <UIcon :name="file.icon" class="size-3.5 shrink-0" />
        <span class="truncate flex-1 text-left">{{ file.label }}</span>
        <span
          v-if="dirtyPaths.has(file.path)"
          class="rs-tree__dirty-dot"
          title="Sin guardar"
        />
        <UIcon
          v-else-if="file.sensitive"
          name="i-lucide-lock"
          class="size-3 opacity-50 shrink-0"
        />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.rs-drawer__tree {
  background: color-mix(in srgb, var(--rs-surface) 60%, var(--rs-bg));
  border-right: 1px solid var(--rs-border);
  overflow-y: auto;
  padding: 0.6rem 0;
}

.rs-tree__group {
  margin-bottom: 0.65rem;
}

.rs-tree__group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem 0.35rem;
}

.rs-tree__tier-badge {
  font-family: var(--rs-font-display);
  font-size: var(--rs-text-2xs);
  letter-spacing: 0.05em;
  border: 1px solid currentColor;
  padding: 0.1rem 0.35rem;
  line-height: 1;
}

.rs-tree__group-label {
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-2xs);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rs-text-dim);
}

.rs-tree__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.85rem 0.4rem 1rem;
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-md);
  font-weight: 500;
  color: var(--rs-text-muted);
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: all 120ms;
}

.rs-tree__item:hover {
  background: color-mix(in srgb, var(--rs-cyan) 6%, transparent);
  color: var(--rs-text);
}

.rs-tree__item--active {
  color: var(--rs-pink) !important;
  background: linear-gradient(90deg, color-mix(in srgb, var(--rs-pink) 15%, transparent), transparent 80%);
  border-left-color: var(--rs-pink);
  text-shadow: 0 0 6px color-mix(in srgb, var(--rs-pink) 50%, transparent);
}

.rs-tree__dirty-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--rs-yellow);
  box-shadow: 0 0 6px var(--rs-yellow);
  flex-shrink: 0;
}
</style>
