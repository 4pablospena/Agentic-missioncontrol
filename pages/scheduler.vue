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
} = useScheduler()

onMounted(() => {
  void loadSchedules()
})

async function onSubmit(payload: ScheduleTaskPayload) {
  await createSchedule(payload)
}
</script>

<template>
  <UDashboardPanel id="scheduler">
    <template #header>
      <UDashboardNavbar title="Scheduler" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
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
      <section class="page-toolbar pb-6">
        <h2 class="text-highlighted font-semibold tracking-tight">
          Cron & scheduled jobs
        </h2>
        <p class="text-muted mt-1 max-w-2xl text-sm leading-snug">
          Define payloads and cron expressions mapped to Nitro-backed schedules. Matches the observability shell used across Mission Control.
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
          />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
