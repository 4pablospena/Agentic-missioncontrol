export interface AgentProfile {
  /** Substring match against agent.name from Openclaw (case-insensitive) */
  nameMatch: string
  displayName: string
  department: string
  role: string
  tools: string[]
  /** CSS hex color — used for neon glow and borders */
  neonColor: string
  /** Tailwind color name for UBadge/UButton compatibility */
  twColor: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary'
  icon: string
  quickActionLabel: string
  quickActionInstruction: string
}

export const AGENT_PROFILES: AgentProfile[] = [
  {
    nameMatch: 'sales',
    displayName: 'SARBINA',
    department: 'SALES',
    role: 'Prospección y ventas',
    tools: ['LinkedIn', 'Odoo', 'Unipile', 'Lusha'],
    neonColor: '#00ff88',
    twColor: 'success',
    icon: 'i-lucide-target',
    quickActionLabel: 'Buscar prospects',
    quickActionInstruction:
      'Busca nuevos prospects en LinkedIn usando nuestros criterios habituales. Filtra los ya existentes en Odoo y añade los nuevos. Usa Lusha para enriquecer datos de contacto.',
  },
  {
    nameMatch: 'marketing',
    displayName: 'MARK',
    department: 'MARKETING',
    role: 'Contenido y LinkedIn',
    tools: ['LinkedIn', 'Unipile', 'Lusha'],
    neonColor: '#00d4ff',
    twColor: 'info',
    icon: 'i-lucide-megaphone',
    quickActionLabel: 'Tendencias → posts',
    quickActionInstruction:
      'Busca las tendencias más relevantes del día para nuestro sector y redacta los mejores posts para publicar en LinkedIn. Elige el tono y formato más adecuado para nuestra audiencia.',
  },
  {
    nameMatch: 'crm',
    displayName: 'ODÍNN',
    department: 'CRM',
    role: 'Gestión de clientes',
    tools: ['Odoo'],
    neonColor: '#bf5fff',
    twColor: 'secondary',
    icon: 'i-lucide-database',
    quickActionLabel: 'Actualizar CRM',
    quickActionInstruction:
      'Revisa los leads y oportunidades en Odoo. Actualiza estados, detecta leads sin actividad reciente y genera un resumen de las oportunidades más calientes del pipeline.',
  },
  {
    nameMatch: 'engineering',
    displayName: 'ENZO',
    department: 'ENGINEERING',
    role: 'Código y repositorio',
    tools: ['GitHub'],
    neonColor: '#ffff00',
    twColor: 'warning',
    icon: 'i-lucide-code-2',
    quickActionLabel: 'Revisar repositorio',
    quickActionInstruction:
      'Revisa los PRs abiertos, issues sin asignar y el estado general del repositorio en GitHub. Prioriza y genera un resumen del trabajo pendiente.',
  },
  {
    nameMatch: 'people',
    displayName: 'PENELOPE',
    department: 'PEOPLE',
    role: 'RRHH y legal',
    tools: ['Odoo', 'Legal Entity'],
    neonColor: '#ff6b35',
    twColor: 'error',
    icon: 'i-lucide-users',
    quickActionLabel: 'Gestionar RRHH',
    quickActionInstruction:
      'Revisa las tareas de RRHH pendientes en Odoo y gestiona los trámites legales activos. Genera un resumen del estado del equipo.',
  },
  {
    nameMatch: 'design',
    displayName: 'DESTIN',
    department: 'DESIGN',
    role: 'Diseño y visuales',
    tools: ['Excalidraw'],
    neonColor: '#ff2d7a',
    twColor: 'error',
    icon: 'i-lucide-pen-tool',
    quickActionLabel: 'Preparar materiales',
    quickActionInstruction:
      'Revisa los diseños pendientes y crea los materiales visuales necesarios para hoy en Excalidraw.',
  },
]

export function getProfileForAgent(agentName: string): AgentProfile | undefined {
  const lower = agentName.toLowerCase()
  return AGENT_PROFILES.find(p => lower.includes(p.nameMatch.toLowerCase()))
}
