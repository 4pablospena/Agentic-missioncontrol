<script setup lang="ts">
import type { ScheduleTaskPayload } from '~/models/scheduler'

definePageMeta({ layout: 'dashboard' })

const {
  schedules,
  pending,
  errorMsg,
  loadSchedules,
  createSchedule,
  removeSchedule,
  enableSchedule,
  disableSchedule,
  runScheduleNow,
} = useScheduler()

onMounted(() => {
  void loadSchedules()
})

async function onSubmit(payload: ScheduleTaskPayload) {
  await createSchedule(payload)
}

const weeklyTimeline = computed(() => {
  const now = Date.now()
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000
  return schedules.value
    .filter((schedule) => {
      if (!schedule.nextRunAt)
        return false
      const ts = Date.parse(schedule.nextRunAt)
      return Number.isFinite(ts) && ts >= now && ts <= weekEnd
    })
    .sort((a, b) => Date.parse(a.nextRunAt ?? '') - Date.parse(b.nextRunAt ?? ''))
})
</script>

<template>
  <UDashboardPanel id="scheduler">
    <template #header>
      <UDashboardNavbar title="Scheduler" :ui="{ right: 'gap-3' }">
        <template #leading>
          <DashboardMobileNavToggle />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="pending"
            @click="loadSchedules"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="hud-panel panel-shell page-toolbar rounded-xl px-4 py-4">
        <h2 class="text-highlighted font-semibold tracking-tight">
          Mission Scheduler
        </h2>
        <p class="text-muted mt-1 max-w-2xl text-sm leading-snug">
          Control recurring automations, force runs and validate next execution windows like a tactical timeline.
        </p>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <SchedulerScheduleTaskForm @submit="onSubmit" />

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <span class="text-highlighted font-semibold">Schedules</span>
          </template>

          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            title="Scheduler error"
            :description="errorMsg"
            class="mb-4"
          />

          <SchedulerScheduledTaskList
            :schedules="schedules"
            :pending="pending"
            @remove="removeSchedule"
            @enable="enableSchedule"
            @disable="disableSchedule"
            @run-now="runScheduleNow"
          />
        </UCard>
      </div>

      <UCard class="panel-shell mt-6 rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
        <template #header>
          <span class="text-highlighted font-semibold">Weekly timeline</span>
        </template>
        <ul v-if="weeklyTimeline.length" class="space-y-2 text-sm">
          <li
            v-for="schedule in weeklyTimeline"
            :key="schedule.id"
            class="panel-shell-nested flex items-center justify-between gap-2 rounded-lg px-3 py-2"
          >
            <span class="text-highlighted">{{ schedule.taskTemplate.title }}</span>
            <span class="text-muted font-mono text-xs">{{ schedule.nextRunAt }}</span>
          </li>
        </ul>
        <CommonEmptyState
          v-else
          title="No upcoming runs this week."
          description="Schedules with next execution inside 7 days appear here."
          icon="i-lucide-calendar-clock"
          variant="compact"
        />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
