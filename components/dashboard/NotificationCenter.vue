<script setup lang="ts">
import type { Notification, NotificationSeverity, NotificationStatusFilter } from '~/models/notification'

interface Props {
  items: readonly Notification[]
  loading: boolean
  errorMsg: string
  status: NotificationStatusFilter
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'mark-read', id: string): void
  (e: 'mark-all-read'): void
  (e: 'refresh'): void
  (e: 'set-status', status: NotificationStatusFilter): void
  (e: 'close'): void
}>()

interface NotificationGroup {
  key: string
  label: string
  items: Notification[]
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: 'short',
})

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return iso
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay)
    return 'Today'
  const yesterday = new Date(today.getTime() - 86_400_000)
  if (d.toDateString() === yesterday.toDateString())
    return 'Yesterday'
  return dateFormatter.format(d)
}

const groups = computed<NotificationGroup[]>(() => {
  const map = new Map<string, NotificationGroup>()
  for (const item of props.items) {
    const key = dayKey(item.createdAt)
    const existing = map.get(key)
    if (existing) {
      existing.items.push(item)
    }
    else {
      map.set(key, {
        key,
        label: dayLabel(item.createdAt),
        items: [item],
      })
    }
  }
  return [...map.values()]
})

function severityIcon(severity: NotificationSeverity): string {
  switch (severity) {
    case 'error':
      return 'i-lucide-octagon-alert'
    case 'warn':
      return 'i-lucide-triangle-alert'
    case 'success':
      return 'i-lucide-check-circle-2'
    default:
      return 'i-lucide-info'
  }
}

function severityClass(severity: NotificationSeverity): string {
  switch (severity) {
    case 'error':
      return 'text-error'
    case 'warn':
      return 'text-warning'
    case 'success':
      return 'text-success'
    default:
      return 'text-primary'
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return ''
  return timeFormatter.format(d)
}

const tabs = [
  { value: 'unread' as const, label: 'Unread' },
  { value: 'all' as const, label: 'All' },
]
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <header class="border-default flex items-center justify-between gap-3 border-b px-4 py-3">
      <div class="flex flex-col">
        <h2 class="text-highlighted text-sm font-semibold">
          Notifications
        </h2>
        <p class="text-muted text-xs">
          Persisted from realtime events
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Refresh notifications"
          :disabled="loading"
          @click="emit('refresh')"
        />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Close notifications"
          @click="emit('close')"
        />
      </div>
    </header>

    <div class="border-default flex items-center justify-between gap-2 border-b px-4 py-2">
      <UTabs
        :model-value="status"
        :items="tabs"
        size="xs"
        variant="link"
        :ui="{ root: 'min-w-0', list: 'w-auto' }"
        @update:model-value="(value) => emit('set-status', value as NotificationStatusFilter)"
      />
      <UButton
        label="Mark all as read"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled="loading || items.length === 0"
        @click="emit('mark-all-read')"
      />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <UAlert
        v-if="errorMsg"
        color="error"
        variant="subtle"
        :title="errorMsg"
        class="m-4"
      />

      <CommonEmptyState
        v-else-if="loading && items.length === 0"
        loading
        title="Loading notifications…"
        variant="compact"
      />

      <CommonEmptyState
        v-else-if="items.length === 0"
        :title="status === 'unread' ? 'No unread notifications' : 'No notifications yet'"
        :description="status === 'unread' ? 'Critical events show up here as they happen.' : 'Once an alert or task event is broadcast, it will be persisted here.'"
        icon="i-lucide-bell-off"
        variant="compact"
      />

      <ul v-else class="divide-default divide-y">
        <li
          v-for="group in groups"
          :key="group.key"
          class="flex flex-col"
        >
          <p class="text-muted bg-elevated/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wide">
            {{ group.label }}
          </p>
          <ul class="divide-default flex flex-col divide-y">
            <li
              v-for="item in group.items"
              :key="item.id"
              class="hover:bg-elevated/40 flex items-start gap-3 px-4 py-3 transition-colors"
              :class="!item.read ? 'bg-primary/5' : ''"
            >
              <UIcon
                :name="severityIcon(item.severity)"
                :class="['size-4 shrink-0 mt-0.5', severityClass(item.severity)]"
              />
              <div class="min-w-0 flex-1">
                <p class="text-highlighted truncate text-sm font-medium">
                  {{ item.title }}
                </p>
                <p v-if="item.body" class="text-muted line-clamp-2 text-xs">
                  {{ item.body }}
                </p>
                <p class="text-dimmed mt-1 text-[11px]">
                  {{ formatTime(item.createdAt) }} · {{ item.type }}
                </p>
              </div>
              <UButton
                v-if="!item.read"
                icon="i-lucide-check"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="`Mark notification ${item.title} as read`"
                @click="emit('mark-read', item.id)"
              />
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
