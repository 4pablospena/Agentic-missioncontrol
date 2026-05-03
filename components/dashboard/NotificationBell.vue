<script setup lang="ts">
const props = withDefaults(defineProps<{
  collapsed?: boolean
  /**
   * `header`: compact bell beside Mission Control in sidebar header.
   * `sidebar`: full-width row (legacy bottom-bar placement).
   */
  placement?: 'header' | 'sidebar'
}>(), {
  placement: 'sidebar',
})

const open = ref(false)

const {
  items,
  status,
  setStatus,
  loading,
  errorMsg,
  unreadCount,
  refresh,
  markRead,
  markAllRead,
} = useNotifications()

onMounted(() => {
  void refresh()
})

const badgeLabel = computed(() => {
  const n = unreadCount.value
  if (n === 0)
    return ''
  if (n > 99)
    return '99+'
  return String(n)
})

const buttonAriaLabel = computed(() => {
  return unreadCount.value > 0
    ? `Notifications, ${unreadCount.value} unread`
    : 'Notifications'
})

const isHeader = computed(() => props.placement === 'header')
</script>

<template>
  <div class="shrink-0" :class="isHeader ? '' : 'w-full'">
    <USlideover
      v-model:open="open"
      side="right"
      :ui="{
        content: 'w-[24rem] max-w-[90vw]',
        body: 'p-0',
        header: 'hidden',
      }"
    >
      <UTooltip text="Notifications" :disabled="!collapsed && !isHeader">
        <UButton
          icon="i-lucide-bell"
          color="neutral"
          variant="ghost"
          :square="collapsed || isHeader"
          :block="!isHeader"
          size="md"
          :aria-label="buttonAriaLabel"
          class="data-[state=open]:bg-elevated relative"
          :class="[
            isHeader ? 'shrink-0' : 'justify-start',
            !isHeader && collapsed ? 'justify-center' : '',
            !isHeader && !collapsed ? 'w-full' : '',
            isHeader && collapsed ? 'w-full' : '',
          ]"
        >
          <template v-if="!collapsed && !isHeader" #default>
            <span class="text-sm">Notifications</span>
          </template>
          <template v-if="badgeLabel" #trailing>
            <UBadge
              color="primary"
              variant="solid"
              size="xs"
              :class="collapsed || isHeader
                ? 'absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px]'
                : ''"
            >
              {{ badgeLabel }}
            </UBadge>
          </template>
        </UButton>
      </UTooltip>

      <template #body>
        <DashboardNotificationCenter
          :items="items"
          :loading="loading"
          :error-msg="errorMsg"
          :status="status"
          @mark-read="markRead"
          @mark-all-read="markAllRead"
          @refresh="refresh"
          @set-status="setStatus"
          @close="open = false"
        />
      </template>
    </USlideover>
  </div>
</template>
