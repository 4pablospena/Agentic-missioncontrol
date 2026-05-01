import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import type { Alert } from '~/models/alert'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createAlertService, type AlertService } from '~/services/alert.service'

export interface UseAlertsOptions {
  alertService?: AlertService
  events?: Ref<MissionControlEvent[]>
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { apiBase } = useMcConfig()
  const alerts = ref<Alert[]>([])
  const pending = ref(false)
  const errorMsg = ref('')
  const ackPendingId = ref<string | null>(null)

  function resolveService(): AlertService {
    if (options.alertService)
      return options.alertService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createAlertService(client)
  }

  async function refresh() {
    pending.value = true
    errorMsg.value = ''
    try {
      alerts.value = await resolveService().list()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function acknowledge(alertId: string) {
    ackPendingId.value = alertId
    errorMsg.value = ''
    try {
      await resolveService().acknowledge(alertId)
      await refresh()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      ackPendingId.value = null
    }
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last?.type === 'alert.created')
        void refresh()
    },
    { deep: true },
  )

  return {
    alerts: readonly(alerts),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    ackPendingId: readonly(ackPendingId),
    refresh,
    acknowledge,
  }
}
