import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

export interface DashboardShellMobileNav {
  open: () => void
  close: () => void
  isOpen: Readonly<Ref<boolean>>
}

const dashboardShellMobileNavKey: InjectionKey<DashboardShellMobileNav> = Symbol(
  'dashboardShellMobileNav',
)

export function provideDashboardShellMobileNav(state: DashboardShellMobileNav) {
  provide(dashboardShellMobileNavKey, state)
}

export function useDashboardShellMobileNav(): DashboardShellMobileNav | null {
  return inject(dashboardShellMobileNavKey, null)
}
