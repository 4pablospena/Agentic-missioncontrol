/**
 * Mock content for agent files — used for local testing without a real Openclaw backend.
 * Structure follows the Openclaw 4-tier hierarchy (T0..T4).
 */

export type FileTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4'
export type FileLanguage = 'markdown' | 'json' | 'env'

export interface AgentFile {
  /** File path relative to agent directory (e.g. "SOUL.md", "memory/2026-05-10.md") */
  path: string
  /** Display name shown in the navigation */
  label: string
  /** Tier classification (T0 = identity, T4 = system) */
  tier: FileTier
  /** Lucide icon name */
  icon: string
  /** Short description of what this file controls */
  description: string
  /** Syntax highlighting hint */
  language: FileLanguage
  /** Whether the file is read-only (e.g. .env should never be exposed in plain) */
  sensitive?: boolean
  /** Initial content */
  content: string
}

export interface TierMeta {
  id: FileTier
  label: string
  caption: string
}

export const TIER_META: TierMeta[] = [
  { id: 'T0', label: 'Identidad',     caption: 'Inmutable' },
  { id: 'T1', label: 'Comportamiento', caption: 'Operativo' },
  { id: 'T2', label: 'Memoria',        caption: 'Persistente' },
  { id: 'T3', label: 'Capacidades',    caption: 'Skills' },
  { id: 'T4', label: 'Sistema',        caption: 'Config' },
]

/** Standard file template (same across all agents, only `content` varies) */
function buildFiles(agentName: string, role: string, tools: string[]): AgentFile[] {
  const today = new Date().toISOString().slice(0, 10)
  const tier4ConfigDefault = JSON.stringify({
    name: agentName.toLowerCase(),
    model: 'claude-sonnet-4',
    temperature: 0.7,
    channels: { telegram: false, slack: true, email: true },
    memory: {
      embeddings: 'openai/text-embedding-3-small',
      decay: 'logarithmic',
    },
    gateway: {
      port: 18789,
      auth: { mode: 'token', scopes: ['operator.read', 'operator.write'] },
    },
  }, null, 2)

  return [
    {
      path: 'SOUL.md',
      label: 'SOUL',
      tier: 'T0',
      icon: 'i-lucide-flame',
      description: 'Identidad inmutable — quién eres',
      language: 'markdown',
      content: `# ${agentName}\n\n## Identidad\nSoy ${agentName}, ${role.toLowerCase()} del equipo.\n\n## Personalidad\n- Directo y eficiente\n- Proactivo, anticipo necesidades\n- Hablo en español, tono profesional pero cercano\n\n## Especialidad\n${role}\n\n## Límites éticos\n- No comparto datos confidenciales sin autorización explícita\n- No tomo decisiones financieras sin confirmación\n- No envío comunicaciones masivas sin revisión humana\n\n## Lo que NO debo hacer\n- Inventar datos cuando no los tengo\n- Saltar el flujo de aprobación de mi operador\n- Modificar archivos en T0 (incluida esta SOUL)\n`,
    },
    {
      path: 'IDENTITY.md',
      label: 'IDENTITY',
      tier: 'T0',
      icon: 'i-lucide-fingerprint',
      description: 'Metadatos de routing',
      language: 'markdown',
      content: `# Identity\n\n- **id**: ${agentName.toLowerCase()}\n- **name**: ${agentName}\n- **role**: ${role}\n- **version**: 1.0.0\n- **created**: 2026-01-15\n- **owner**: pablo@resiz.es\n- **tags**: [${role.toLowerCase()}, production]\n`,
    },
    {
      path: 'AGENTS.md',
      label: 'AGENTS',
      tier: 'T1',
      icon: 'i-lucide-cpu',
      description: 'Cómo opero — flujos y workflows',
      language: 'markdown',
      content: `# Manual de operaciones — ${agentName}\n\n## Flujo diario\n1. Al inicio de cada sesión leo USER.md y MEMORY.md\n2. Reviso HEARTBEAT.md para tareas proactivas pendientes\n3. Proceso la cola de instrucciones del operador\n4. Al finalizar, persisto memoria episódica en memory/${today}.md\n\n## Reglas de escalado\n- Si una tarea requiere acceso a datos sensibles → solicito autorización\n- Si el contexto excede mi confianza → consulto al operador\n- Si detecto un error crítico → escalo y detengo la operación\n\n## Tickets / Tareas\nCada tarea recibida lleva los siguientes campos:\n- \`taskId\`: identificador único\n- \`instruction\`: orden en lenguaje natural\n- \`priority\`: low | normal | high | critical\n\n## Herramientas disponibles\n${tools.map(t => `- ${t}`).join('\n')}\n`,
    },
    {
      path: 'USER.md',
      label: 'USER',
      tier: 'T1',
      icon: 'i-lucide-user-cog',
      description: 'Perfil del operador / equipo',
      language: 'markdown',
      content: `# Perfil del operador\n\n## Identidad\n- **Nombre**: Pablo\n- **Email**: pablo@resiz.es\n- **Rol**: Founder\n- **Empresa**: Resiz\n\n## Preferencias de comunicación\n- Tono: directo, sin relleno\n- Formato: respuestas concisas, listas cuando aplica\n- Idioma: español\n\n## Proyectos activos\n- Mission Control para Openclaw\n- Sistema agentic para automatizar B2B\n\n## Stack técnico\n- Vue 3 / Nuxt 3 / TypeScript\n- Tailwind CSS\n- SQLite + Drizzle\n\n## Lo que valora\n- Eficiencia sobre formalidad\n- Mostrar datos antes que opinar\n- Avisar de bloqueos cuanto antes\n`,
    },
    {
      path: 'MEMORY.md',
      label: 'MEMORY',
      tier: 'T2',
      icon: 'i-lucide-brain',
      description: 'Memoria evergreen — siempre vigente',
      language: 'markdown',
      content: `# Memoria persistente\n\n## Hechos del operador\n- Trabaja con la cuenta de LinkedIn personal y la de empresa Resiz\n- Tiene acceso a Odoo en https://resiz.odoo.com\n- Pipeline principal: "Outbound Q2 2026"\n\n## Hechos del proyecto\n- El gateway de Openclaw corre en 100.117.213.11:18789 vía Tailscale\n- Tokens vencen el 31 de diciembre de 2026\n\n## Aprendizajes recurrentes\n- Pablo prefiere ver propuestas concretas antes que hacerle preguntas abiertas\n- Las publicaciones de LinkedIn los martes a las 9am rinden 2× mejor\n`,
    },
    {
      path: `memory/${today}.md`,
      label: today,
      tier: 'T2',
      icon: 'i-lucide-calendar-days',
      description: 'Log diario de hoy',
      language: 'markdown',
      content: `# ${today}\n\n## Resumen\n_Aún no se ha registrado actividad hoy._\n\n## Eventos\n- (vacío)\n\n## Decisiones\n- (vacío)\n`,
    },
    {
      path: 'HEARTBEAT.md',
      label: 'HEARTBEAT',
      tier: 'T3',
      icon: 'i-lucide-activity',
      description: 'Tareas proactivas (cada 30 min)',
      language: 'markdown',
      content: `# Tareas proactivas\n\n## Cron\nFrecuencia: cada 30 minutos\n\n## Tareas\n\n### 1. Resumen matutino\n- **cuando**: lunes a viernes a las 08:00\n- **acción**: enviar al operador un brief con prioridades del día\n\n### 2. Revisión vespertina\n- **cuando**: cada día a las 19:00\n- **acción**: cerrar pendientes y agendar mañana\n\n### 3. Alertas críticas\n- **cuando**: cada 30 min\n- **acción**: comprobar si hay nuevos eventos en herramientas y notificar si son críticos\n`,
    },
    {
      path: 'TOOLS.md',
      label: 'TOOLS',
      tier: 'T3',
      icon: 'i-lucide-wrench',
      description: 'Skills instaladas',
      language: 'markdown',
      content: `# Capacidades instaladas\n\n${tools.map(t => `## ${t}\n- **estado**: activa\n- **autenticación**: OAuth2\n- **scopes**: read + write\n`).join('\n')}\n\n## Skills opcionales (no instaladas)\n- web-search\n- calendar-sync\n- email-templates\n`,
    },
    {
      path: 'openclaw.json',
      label: 'openclaw.json',
      tier: 'T4',
      icon: 'i-lucide-settings-2',
      description: 'Config central del agente',
      language: 'json',
      content: tier4ConfigDefault,
    },
    {
      path: '.env',
      label: '.env',
      tier: 'T4',
      icon: 'i-lucide-key-round',
      description: 'Secrets (nunca se sube a Git)',
      language: 'env',
      sensitive: true,
      content: `# API Keys del agente — confidencial\n# NUNCA commitar a Git. Cifrado en reposo.\n\nANTHROPIC_API_KEY=sk-ant-•••••••••••••••••\nLINKEDIN_TOKEN=••••••••••••••••\nODOO_API_KEY=••••••••••••••••\nUNIPILE_KEY=••••••••••••••••\n`,
    },
  ]
}

/** Mock files keyed by agent id (matches openclaw-bridge.mock.ts) */
export const AGENT_FILES_MOCK: Record<string, AgentFile[]> = {
  sarbina:  buildFiles('Sarbina',  'Prospección y ventas',     ['LinkedIn', 'Odoo', 'Unipile', 'Lusha']),
  mark:     buildFiles('Mark',     'Marketing y contenido',    ['LinkedIn', 'Unipile', 'Lusha']),
  odinn:    buildFiles('Odínn',    'Gestión de clientes',      ['Odoo']),
  enzo:     buildFiles('Enzo',     'Ingeniería y código',      ['GitHub']),
  penelope: buildFiles('Penelope', 'Recursos humanos y legal', ['Odoo', 'Legal Entity']),
  destin:   buildFiles('Destin',   'Diseño y materiales',      ['Excalidraw']),
}

export function getFilesForAgent(agentId: string): AgentFile[] {
  return AGENT_FILES_MOCK[agentId] ?? []
}
