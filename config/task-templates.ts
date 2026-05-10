import type { CreateTaskPayload, TaskPriority } from '~/models/task'

export interface TaskField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox'
  placeholder?: string
  required?: boolean
  options?: string[]
  default?: string | number | boolean
}

export interface QuickAction {
  id: string
  agentNameMatch: string
  label: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo'
  toPayload: (agentId: string) => CreateTaskPayload
}

export interface TaskTemplate {
  id: string
  agentNameMatch: string
  name: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo'
  priority: TaskPriority
  fields: TaskField[]
  toPayload: (agentId: string, values: Record<string, unknown>) => CreateTaskPayload
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // ────────── MARKETING ──────────
  {
    id: 'marketing-publish-post',
    agentNameMatch: 'marketing',
    name: 'Publicar post en LinkedIn',
    description: 'Redacta y publica un post en LinkedIn',
    icon: 'i-lucide-megaphone',
    color: 'blue',
    priority: 'normal',
    fields: [
      {
        key: 'topic',
        label: 'Tema del post',
        type: 'text',
        placeholder: 'Ej: Cómo la IA mejora la productividad en equipos de ventas',
        required: true,
      },
      {
        key: 'tone',
        label: 'Tono',
        type: 'select',
        required: true,
        options: ['Profesional', 'Cercano', 'Inspiracional', 'Educativo'],
        default: 'Profesional',
      },
      {
        key: 'cta',
        label: 'Call to action (opcional)',
        type: 'text',
        placeholder: 'Ej: ¿Qué opinas tú?',
      },
      {
        key: 'hashtags',
        label: 'Hashtags (separados por comas, opcional)',
        type: 'text',
        placeholder: 'Ej: IA, Productividad, Ventas',
      },
    ],
    toPayload: (agentId, values) => ({
      title: `LinkedIn: ${values.topic}`,
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'publish_linkedin_post',
        topic: values.topic,
        tone: values.tone ?? 'Profesional',
        cta: values.cta ?? null,
        hashtags: values.hashtags
          ? String(values.hashtags)
              .split(',')
              .map(h => h.trim())
              .filter(Boolean)
          : [],
      },
    }),
  },
  {
    id: 'marketing-weekly-plan',
    agentNameMatch: 'marketing',
    name: 'Plan de contenido semanal',
    description: 'Genera un plan de posts para la semana con calendario',
    icon: 'i-lucide-calendar-days',
    color: 'blue',
    priority: 'normal',
    fields: [
      {
        key: 'pillars',
        label: 'Pilares de contenido',
        type: 'textarea',
        placeholder: 'Ej: IA en ventas, Casos de éxito de clientes, Consejos de productividad',
        required: true,
      },
      {
        key: 'posts_count',
        label: 'Número de posts',
        type: 'number',
        required: true,
        default: 5,
      },
      {
        key: 'audience',
        label: 'Audiencia objetivo (opcional)',
        type: 'text',
        placeholder: 'Ej: CTOs de startups B2B en España',
      },
    ],
    toPayload: (agentId, values) => ({
      title: `Plan semanal: ${values.posts_count} posts`,
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'generate_weekly_plan',
        pillars: values.pillars,
        posts_count: Number(values.posts_count ?? 5),
        audience: values.audience ?? null,
      },
    }),
  },
  {
    id: 'marketing-analyze-engagement',
    agentNameMatch: 'marketing',
    name: 'Analizar engagement reciente',
    description: 'Revisa las métricas de los últimos posts y genera insights',
    icon: 'i-lucide-bar-chart-3',
    color: 'blue',
    priority: 'low',
    fields: [
      {
        key: 'days',
        label: 'Últimos N días',
        type: 'number',
        required: true,
        default: 7,
      },
      {
        key: 'focus',
        label: 'Qué analizar',
        type: 'select',
        required: true,
        options: ['Todo', 'Impresiones', 'Engagement', 'Seguidores ganados', 'Posts más vistos'],
        default: 'Todo',
      },
    ],
    toPayload: (agentId, values) => ({
      title: `Análisis engagement últimos ${values.days} días`,
      assignedAgentId: agentId,
      priority: 'low',
      input: {
        action: 'analyze_engagement',
        days: Number(values.days ?? 7),
        focus: values.focus ?? 'Todo',
      },
    }),
  },

  // ────────── PROSPECTING ──────────
  {
    id: 'prospecting-find-leads',
    agentNameMatch: 'prospecting',
    name: 'Buscar leads en LinkedIn',
    description: 'Encuentra perfiles relevantes según criterios de búsqueda',
    icon: 'i-lucide-search',
    color: 'green',
    priority: 'normal',
    fields: [
      {
        key: 'role',
        label: 'Cargo objetivo',
        type: 'text',
        placeholder: 'Ej: Director de Marketing, CTO, Head of Sales',
        required: true,
      },
      {
        key: 'industry',
        label: 'Sector',
        type: 'text',
        placeholder: 'Ej: SaaS, Fintech, Retail, Manufactura',
        required: true,
      },
      {
        key: 'company_size',
        label: 'Tamaño de empresa',
        type: 'select',
        options: ['Cualquiera', '1-10', '11-50', '51-200', '201-500', '500+'],
        default: 'Cualquiera',
      },
      {
        key: 'location',
        label: 'Ubicación (opcional)',
        type: 'text',
        placeholder: 'Ej: España, Madrid, Barcelona',
      },
      {
        key: 'max_results',
        label: 'Máximo de resultados',
        type: 'number',
        required: true,
        default: 20,
      },
    ],
    toPayload: (agentId, values) => ({
      title: `Buscar leads: ${values.role} en ${values.industry}`,
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'find_leads',
        role: values.role,
        industry: values.industry,
        company_size: values.company_size !== 'Cualquiera' ? values.company_size : null,
        location: values.location ?? null,
        max_results: Number(values.max_results ?? 20),
      },
    }),
  },
  {
    id: 'prospecting-start-outreach',
    agentNameMatch: 'prospecting',
    name: 'Iniciar outreach',
    description: 'Envía mensajes de conexión personalizados a leads seleccionados',
    icon: 'i-lucide-send',
    color: 'green',
    priority: 'high',
    fields: [
      {
        key: 'leads_source',
        label: 'Fuente de leads',
        type: 'select',
        required: true,
        options: ['Última búsqueda', 'URL de búsqueda LinkedIn', 'IDs de Odoo'],
        default: 'Última búsqueda',
      },
      {
        key: 'leads_ref',
        label: 'URL o IDs (si no es "Última búsqueda")',
        type: 'text',
        placeholder: 'Ej: https://linkedin.com/search/... o IDs separados por coma',
      },
      {
        key: 'message_key',
        label: 'Mensaje clave de conexión',
        type: 'textarea',
        placeholder: 'Ej: Vi que trabajas en {empresa} y creo que podríamos colaborar...',
        required: true,
      },
      {
        key: 'personalize',
        label: 'Personalizar mensaje con IA',
        type: 'checkbox',
        default: true,
      },
    ],
    toPayload: (agentId, values) => ({
      title: `Outreach: ${values.leads_source}`,
      assignedAgentId: agentId,
      priority: 'high',
      input: {
        action: 'start_outreach',
        leads_source: values.leads_source,
        leads_ref: values.leads_ref ?? null,
        message_key: values.message_key,
        personalize: Boolean(values.personalize ?? true),
      },
    }),
  },
  {
    id: 'prospecting-sync-odoo',
    agentNameMatch: 'prospecting',
    name: 'Sincronizar leads en Odoo',
    description: 'Actualiza el CRM de Odoo con los leads encontrados en LinkedIn',
    icon: 'i-lucide-refresh-cw',
    color: 'green',
    priority: 'normal',
    fields: [
      {
        key: 'filter_status',
        label: 'Estado de los leads a sincronizar',
        type: 'select',
        required: true,
        options: ['Todos los nuevos', 'Contactados', 'Interesados', 'Calificados'],
        default: 'Todos los nuevos',
      },
      {
        key: 'pipeline',
        label: 'Pipeline de Odoo (opcional)',
        type: 'text',
        placeholder: 'Nombre del pipeline destino',
      },
      {
        key: 'add_note',
        label: 'Añadir nota de origen en Odoo',
        type: 'checkbox',
        default: true,
      },
    ],
    toPayload: (agentId, values) => ({
      title: `Sync Odoo: ${values.filter_status}`,
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'sync_odoo',
        filter_status: values.filter_status,
        pipeline: values.pipeline ?? null,
        add_note: Boolean(values.add_note ?? true),
      },
    }),
  },
]

/** Returns templates matching a given agent name (case-insensitive substring). */
export function getTemplatesForAgent(agentName: string): TaskTemplate[] {
  const lower = agentName.toLowerCase()
  return TASK_TEMPLATES.filter(t => lower.includes(t.agentNameMatch.toLowerCase()))
}

/** Returns all unique agent slugs referenced by templates. */
export const TEMPLATE_AGENT_SLUGS = [...new Set(TASK_TEMPLATES.map(t => t.agentNameMatch))]

// ─────────────────────────────────────────────────────────────────────────────
// QUICK ACTIONS — one click, zero fields, smart defaults
// The agent receives a high-level instruction and decides the best approach.
// ─────────────────────────────────────────────────────────────────────────────
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'marketing-daily',
    agentNameMatch: 'marketing',
    label: 'Buscar tendencias y preparar posts',
    description: 'El agente busca las tendencias del día y redacta los mejores posts para LinkedIn',
    icon: 'i-lucide-trending-up',
    color: 'blue',
    toPayload: agentId => ({
      title: 'Tendencias del día → posts LinkedIn',
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'daily_content',
        mode: 'auto',
        instruction: 'Busca las tendencias más relevantes del día para nuestro sector y prepara los mejores posts para publicar en LinkedIn. Elige el tono y formato más adecuado.',
      },
    }),
  },
  {
    id: 'prospecting-daily',
    agentNameMatch: 'prospecting',
    label: 'Buscar nuevos prospects',
    description: 'El agente busca perfiles relevantes en LinkedIn y los añade al CRM',
    icon: 'i-lucide-users',
    color: 'green',
    toPayload: agentId => ({
      title: 'Búsqueda diaria de prospects',
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'daily_prospecting',
        mode: 'auto',
        instruction: 'Busca nuevos perfiles relevantes en LinkedIn según nuestros criterios habituales. Filtra los que ya estén en Odoo y añade los nuevos automáticamente.',
      },
    }),
  },
  {
    id: 'crm-daily',
    agentNameMatch: 'crm',
    label: 'Gestionar el CRM',
    description: 'El agente revisa Odoo, actualiza estados y detecta oportunidades',
    icon: 'i-lucide-bar-chart-2',
    color: 'purple',
    toPayload: agentId => ({
      title: 'Gestión diaria del CRM',
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'daily_crm',
        mode: 'auto',
        instruction: 'Revisa los leads y oportunidades en Odoo. Actualiza estados, detecta leads sin actividad reciente y genera un resumen de las oportunidades más calientes.',
      },
    }),
  },
  {
    id: 'design-daily',
    agentNameMatch: 'design',
    label: 'Preparar materiales visuales',
    description: 'El agente crea y actualiza los diseños pendientes en Excalidraw',
    icon: 'i-lucide-pen-tool',
    color: 'orange',
    toPayload: agentId => ({
      title: 'Materiales visuales del día',
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'daily_design',
        mode: 'auto',
        instruction: 'Revisa los diseños pendientes y crea los materiales visuales necesarios para hoy en Excalidraw.',
      },
    }),
  },
  {
    id: 'engineering-daily',
    agentNameMatch: 'engineering',
    label: 'Revisar y gestionar repositorio',
    description: 'El agente revisa PRs, issues y el estado del repositorio en GitHub',
    icon: 'i-lucide-git-pull-request',
    color: 'indigo',
    toPayload: agentId => ({
      title: 'Gestión diaria del repositorio',
      assignedAgentId: agentId,
      priority: 'normal',
      input: {
        action: 'daily_engineering',
        mode: 'auto',
        instruction: 'Revisa los PRs abiertos, issues sin asignar y el estado general del repositorio en GitHub. Prioriza y genera un resumen del trabajo pendiente.',
      },
    }),
  },
]

/** Returns quick actions matching a given agent name (case-insensitive substring). */
export function getQuickActionsForAgent(agentName: string): QuickAction[] {
  const lower = agentName.toLowerCase()
  return QUICK_ACTIONS.filter(qa => lower.includes(qa.agentNameMatch.toLowerCase()))
}
