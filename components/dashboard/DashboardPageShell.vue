<script setup lang="ts">
import type { DashboardPageAccentColor } from '~/models/dashboard-shell'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: string
    accentColor?: DashboardPageAccentColor
    scrollBody?: boolean
    bodyClass?: string
  }>(),
  {
    accentColor: 'indigo',
    scrollBody: true,
    bodyClass: undefined,
  },
)
</script>

<template>
  <div
    class="rs-page-shell flex flex-col min-h-0 flex-1"
    :class="{ 'rs-page-shell--scroll': scrollBody }"
  >
    <RetroPageHeader
      :title="title"
      :subtitle="subtitle"
      :icon="icon"
      :accent-color="accentColor"
    >
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </RetroPageHeader>

    <div
      class="rs-page-shell__body"
      :class="{ 'rs-page-shell__body--scroll': scrollBody }"
    >
      <div class="rs-page" :class="bodyClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.rs-page-shell--scroll {
  overflow: hidden;
}

.rs-page-shell__body--scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.rs-page-shell__body:not(.rs-page-shell__body--scroll) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
