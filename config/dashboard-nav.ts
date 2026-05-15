import type { DashboardNavItem } from '~/models/dashboard-shell'

export interface DashboardNavSection {
  id: string
  label: string
  items: DashboardNavItem[]
}

export interface DashboardNavFlags {
  workspaceEnabled: boolean
  office3dEnabled: boolean
  showDiagnostics: boolean
}

const PRINCIPAL: DashboardNavItem[] = [
  { label: 'Inicio', icon: 'i-lucide-home', to: '/' },
  { label: 'Agentes', icon: 'i-lucide-users', to: '/agents' },
  { label: 'Misiones', icon: 'i-lucide-list-checks', to: '/tasks' },
  { label: 'Chat', icon: 'i-lucide-message-square', to: '/chat' },
]

const OBSERVABILIDAD: DashboardNavItem[] = [
  { label: 'Monitorización', icon: 'i-lucide-activity', to: '/monitoring' },
  { label: 'Registros', icon: 'i-lucide-scroll-text', to: '/logs' },
  { label: 'Memoria', icon: 'i-lucide-brain', to: '/memory' },
  { label: 'Programador', icon: 'i-lucide-calendar-clock', to: '/scheduler' },
]

export function buildDashboardNavSections(flags: DashboardNavFlags): DashboardNavSection[] {
  const sections: DashboardNavSection[] = [
    { id: 'principal', label: 'Principal', items: PRINCIPAL },
    { id: 'observabilidad', label: 'Observabilidad', items: OBSERVABILIDAD },
  ]

  const tools: DashboardNavItem[] = []
  if (flags.workspaceEnabled) {
    tools.push({ label: 'Workspace', icon: 'i-lucide-folder-tree', to: '/workspace' })
  }
  if (flags.office3dEnabled) {
    tools.push({ label: 'Office 3D', icon: 'i-lucide-box', to: '/office' })
  }
  if (flags.showDiagnostics) {
    tools.push({ label: 'Diagnostics', icon: 'i-lucide-wrench', to: '/diagnostics' })
  }

  if (tools.length > 0) {
    sections.push({ id: 'herramientas', label: 'Herramientas', items: tools })
  }

  return sections
}

export function flattenDashboardNav(sections: DashboardNavSection[]): DashboardNavItem[] {
  return sections.flatMap(s => s.items)
}
