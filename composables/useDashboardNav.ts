import { buildDashboardNavSections, flattenDashboardNav } from '~/config/dashboard-nav'

export function useDashboardNav() {
  const { public: publicConfig } = useRuntimeConfig()

  const flags = computed(() => ({
    workspaceEnabled: publicConfig.workspaceEnabled === true,
    office3dEnabled: publicConfig.office3dEnabled === true,
    showDiagnostics: publicConfig.showDiagnostics !== false,
  }))

  const sections = computed(() => buildDashboardNavSections(flags.value))

  const flatItems = computed(() => flattenDashboardNav(sections.value))

  return {
    sections,
    flatItems,
    flags,
  }
}
