# Fase 2: Observabilidad

## Resumen

Duracion estimada: semanas 3-5.

Objetivo: construir la capa de observabilidad de OpenClaw Mission Control. Al terminar esta fase, el usuario debe poder entender el estado de los agentes, revisar logs, detectar errores, analizar sesiones y consultar metricas de recursos sin acceder a consola, base de datos ni servicios internos.

Esta fase se apoya en la infraestructura de la fase 1: autenticacion, API Nitro, modelos base, logging centralizado y canal realtime.

## Principios SOLID que gobiernan la fase

- Single Responsibility: cada modulo visual muestra una cosa. `AgentMonitor` no filtra logs, `LogViewer` no calcula metricas y `ResourceMetrics` no conoce detalles de UI de agentes.
- Open/Closed: los filtros, formatos y fuentes de metricas deben poder extenderse sin reescribir componentes existentes.
- Liskov Substitution: los componentes base de tabla, filtros, inputs y badges deben poder usarse en cualquier modulo sin romper atributos ni eventos.
- Interface Segregation: crear payloads concretos para cada operacion. Evitar un unico objeto `DashboardData` con todo.
- Dependency Inversion: composables como `useAgents`, `useLogs` y `useMetrics` aceptan servicios inyectables para facilitar tests.

## Alcance funcional

- Dashboard principal con metricas en vivo.
- Monitor de agentes con estado, modelo activo, accion actual, tokens y ultima actividad.
- Log viewer con filtros por agente, nivel, fecha y busqueda textual.
- Timeline de eventos por sesion.
- Alertas y errores con severidad.
- Graficos de uso de tokens, recursos, modelos y sesiones.
- Integracion del canal realtime con logs, agentes, alertas y metricas.

## Estructura de archivos objetivo

```txt
app/
+-- components/
|   +-- agents/
|   |   +-- AgentStatusBadge.vue
|   |   +-- AgentSummaryCard.vue
|   |   +-- AgentMonitorTable.vue
|   +-- alerts/
|   |   +-- AlertList.vue
|   |   +-- AlertSeverityBadge.vue
|   +-- logs/
|   |   +-- LogFilters.vue
|   |   +-- LogLevelBadge.vue
|   |   +-- LogRow.vue
|   |   +-- LogViewer.vue
|   +-- metrics/
|   |   +-- MetricCard.vue
|   |   +-- ResourceMetricsPanel.vue
|   |   +-- TokenUsageChart.vue
|   +-- timeline/
|       +-- EventTimeline.vue
|       +-- TimelineItem.vue
+-- composables/
|   +-- useAgents.ts
|   +-- useAlerts.ts
|   +-- useLogs.ts
|   +-- useMetrics.ts
|   +-- useSessionTimeline.ts
+-- models/
|   +-- alert.ts
|   +-- agent.ts
|   +-- log.ts
|   +-- metric.ts
|   +-- timeline.ts
+-- pages/
|   +-- index.vue
|   +-- agents.vue
|   +-- logs.vue
+-- services/
|   +-- agent.service.ts
|   +-- alert.service.ts
|   +-- log.service.ts
|   +-- metric.service.ts
|   +-- timeline.service.ts
+-- utils/
    +-- formatDuration.ts
    +-- formatTokens.ts
    +-- normalizeSeverity.ts
    +-- sortEventsByDate.ts
```

## Paso 1: Definir contratos de observabilidad

Antes de construir UI, definir los modelos compartidos. Los contratos deben ser pequenos, especificos y reutilizables.

Tipos sugeridos:

```ts
export type AgentStatus = 'idle' | 'running' | 'error' | 'offline'

export interface AgentSummary {
  id: string
  name: string
  status: AgentStatus
  model: string
  currentAction?: string
  currentTaskId?: string
  tokenUsage: number
  lastSeenAt: string
}

export interface LogFilters {
  agentId?: string
  level?: 'debug' | 'info' | 'warn' | 'error'
  query?: string
  from?: string
  to?: string
}

export interface Alert {
  id: string
  agentId?: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  acknowledged: boolean
  createdAt: string
}
```

Reglas:

- No usar `any`; si la estructura es desconocida, usar `unknown` o `Record<string, unknown>`.
- Separar filtros de respuesta. `LogFilters` no debe mezclarse con `LogEntry`.
- Cada grafico debe tener su propio tipo de serie, no un tipo generico para todos.

## Paso 2: Servicios de dominio

Crear un servicio por dominio. Los servicios solo comunican con la API y transforman errores tecnicos en errores de dominio.

Servicios esperados:

- `agent.service.ts`
- `log.service.ts`
- `metric.service.ts`
- `alert.service.ts`
- `timeline.service.ts`

Interfaz sugerida para agentes:

```ts
export interface AgentService {
  listAgents(): Promise<AgentSummary[]>
  getAgent(agentId: string): Promise<AgentSummary>
}
```

Interfaz sugerida para logs:

```ts
export interface LogService {
  listLogs(filters: LogFilters): Promise<LogEntry[]>
}
```

Reglas:

- No guardar estado reactivo dentro de servicios.
- No usar `fetch` directo. Usar `ApiClient`.
- No mezclar llamadas de agentes con llamadas de logs en un mismo servicio.

## Paso 3: Composables de observabilidad

Los composables gestionan estado, carga, error y reglas de dominio. Deben recibir servicios como dependencia opcional para facilitar tests.

Composables:

- `useAgents(agentService = defaultAgentService)`
- `useLogs(logService = defaultLogService)`
- `useMetrics(metricService = defaultMetricService)`
- `useAlerts(alertService = defaultAlertService)`
- `useSessionTimeline(timelineService = defaultTimelineService)`

Cada composable debe exponer solo lo necesario. Si un composable supera 10 miembros expuestos, dividirlo.

Ejemplo de salida compacta:

```ts
export interface UseAgentsState {
  agents: Readonly<Ref<AgentSummary[]>>
  isLoading: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  refresh: () => Promise<void>
}
```

## Paso 4: Realtime aplicado a observabilidad

Conectar eventos realtime a los dominios sin acoplar componentes al socket.

Eventos esperados:

```ts
export type ObservabilityEventType =
  | 'agent.status.changed'
  | 'agent.tokens.changed'
  | 'log.created'
  | 'alert.created'
  | 'metric.updated'
  | 'session.event.created'
```

Flujo:

```txt
WebSocket/SSE
  -> realtime.service.ts
  -> useRealtimeEvents.ts
  -> composable de dominio
  -> view
  -> component props
```

Reglas:

- Los componentes no se suscriben directamente al socket.
- Los eventos se normalizan antes de llegar a la UI.
- Si un evento no coincide con el contrato, se registra error y se descarta.

## Paso 5: Dashboard principal

Crear `pages/index.vue` como orquestador. Debe cargar composables y pasar datos a componentes.

Secciones:

- Resumen de agentes activos.
- Errores criticos recientes.
- Tokens usados en ventana temporal.
- Sesiones activas.
- Ultimos logs.
- Timeline resumido.

Componentes:

- `MetricCard.vue`
- `AgentSummaryCard.vue`
- `AlertList.vue`
- `TokenUsageChart.vue`
- `EventTimeline.vue`

Reglas:

- La pagina no calcula metricas complejas.
- El filtrado y agregacion viven en composables o servicios.
- Los componentes visuales reciben datos ya preparados.

## Paso 6: Agent monitor

Construir una vista de agentes en tiempo real.

Campos visibles:

- Nombre del agente.
- Estado.
- Modelo activo.
- Accion actual.
- Tarea actual.
- Tokens usados.
- Ultima actividad.

Pasos:

1. Crear `AgentMonitorTable.vue`.
2. Crear `AgentStatusBadge.vue`.
3. Crear `useAgents`.
4. Conectar eventos `agent.status.changed` y `agent.tokens.changed`.
5. Agregar estado vacio, loading y error.

Checklist:

- [ ] Tabla no llama servicios.
- [ ] Badge no conoce reglas de negocio fuera de su estado visual.
- [ ] Estados posibles estan tipados con union types.

## Paso 7: Log viewer

Construir visor de logs con filtros y busqueda.

Filtros:

- Agente.
- Nivel.
- Texto.
- Fecha desde.
- Fecha hasta.

Pasos:

1. Crear `LogFilters.vue`.
2. Crear `LogViewer.vue`.
3. Crear `LogRow.vue`.
4. Crear `useLogs`.
5. Conectar evento `log.created`.
6. Mantener filtros en query params si aporta valor operativo.

Reglas:

- `LogFilters.vue` emite cambios, no ejecuta busquedas.
- `useLogs` decide cuando recargar.
- Las fechas se formatean en `utils/formatDate.ts`.

## Paso 8: Alertas y errores

Crear panel de alertas con severidad y reconocimiento.

Endpoints:

```txt
GET   /api/alerts
PATCH /api/alerts/:id/acknowledge
```

Tipos:

```ts
export interface AcknowledgeAlertPayload {
  alertId: string
}

export interface AcknowledgeAlertResponse {
  alert: Alert
}
```

Reglas:

- Nuevas severidades deben extender el mapa visual, no crear ramas `if` dispersas.
- Las alertas criticas deben ser visibles en dashboard principal.
- Las acciones de reconocer alerta deben estar en `alert.service.ts`.

## Paso 9: Metricas y graficos

Construir metricas de:

- Tokens por agente.
- Tokens por modelo.
- Sesiones por estado.
- Errores por severidad.
- Uso de almacenamiento si ya esta disponible.

Endpoints:

```txt
GET /api/metrics/tokens
GET /api/metrics/models
GET /api/metrics/sessions
GET /api/metrics/errors
```

Reglas:

- Los componentes de graficos reciben series ya normalizadas.
- La normalizacion de datos vive en `metric.service.ts` o `useMetrics`.
- El componente de grafico no conoce endpoints.

## Paso 10: Timeline de eventos

Crear timeline por sesion.

Campos:

- Tipo de evento.
- Agente.
- Mensaje.
- Metadata resumida.
- Fecha.

Endpoint:

```txt
GET /api/events/session/:sessionId
```

Reglas:

- Ordenar eventos en una utilidad pura.
- Evitar que la vista procese metadata cruda.
- Truncar metadata extensa en componente visual.

## Pruebas minimas

Cubrir:

- `useAgents` con eventos realtime mockeados.
- `useLogs` con filtros.
- `useAlerts` con acknowledge.
- `useMetrics` con transformacion de series.
- Componentes `LogFilters`, `AgentStatusBadge` y `MetricCard`.

Pruebas recomendadas:

- Unit tests de utils de formato.
- Tests de composables con servicios inyectados.
- Tests de endpoints Nitro principales.
- Tests de accesibilidad basica para inputs y botones.

## Criterio de cierre

La fase se considera terminada cuando:

- [ ] El dashboard muestra metricas principales en vivo.
- [ ] El monitor de agentes refleja cambios de estado.
- [ ] El log viewer filtra por agente, nivel, texto y fecha.
- [ ] Las alertas aparecen con severidad y pueden reconocerse.
- [ ] Los graficos reciben datos tipados y normalizados.
- [ ] El timeline muestra eventos por sesion.
- [ ] No hay `fetch` directo fuera de servicios.
- [ ] No hay `any`.
- [ ] Las views solo orquestan composables.
- [ ] Los componentes son presentacionales.
- [ ] Cada composable expone una interfaz pequena y clara.

