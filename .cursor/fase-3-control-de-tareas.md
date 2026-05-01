# Fase 3: Control de tareas

## Resumen

Duracion estimada: semanas 6-8.

Objetivo: convertir OpenClaw Mission Control en una herramienta activa de operacion. Hasta esta fase, el sistema observa agentes, logs y metricas. En esta fase se anade control: crear tareas, asignarlas a agentes, seguir su progreso, consultar resultados, reintentar fallos y programar ejecuciones.

El resultado debe ser un tablero Kanban funcional, conectado en tiempo real, con historial de tareas y soporte de scheduler.

## Principios SOLID que gobiernan la fase

- Single Responsibility: el tablero organiza estados, las tarjetas muestran tareas, el formulario crea payloads y los servicios comunican con API. Ningun modulo debe mezclar estas responsabilidades.
- Open/Closed: nuevos tipos de tarea, estados o triggers deben anadirse extendiendo mapas, contratos y servicios, no reescribiendo el tablero completo.
- Liskov Substitution: componentes como `TaskCard`, `BaseButton` o `BaseModal` deben mantener contratos de props y eventos estables.
- Interface Segregation: separar `CreateTaskPayload`, `UpdateTaskPayload`, `RetryTaskPayload`, `ScheduleTaskPayload` y `TaskFilters`.
- Dependency Inversion: `useTasks` y `useScheduler` deben aceptar servicios opcionales para tests y no crear implementaciones internas rigidas.

## Alcance funcional

- Tablero Kanban con estados: en cola, activa, completada, fallida, cancelada y programada.
- Creacion manual de tareas.
- Asignacion de tareas a agentes.
- Progreso en tiempo real por tarea.
- Vista de detalle de tarea.
- Historial y resultados de ejecucion.
- Reintentos y cancelacion.
- Programacion de tareas con cron.
- Registro de eventos de tarea en logs y timeline.

## Estructura de archivos objetivo

```txt
app/
+-- components/
|   +-- tasks/
|   |   +-- CreateTaskForm.vue
|   |   +-- TaskBoard.vue
|   |   +-- TaskCard.vue
|   |   +-- TaskColumn.vue
|   |   +-- TaskDetailPanel.vue
|   |   +-- TaskProgressBar.vue
|   |   +-- TaskStatusBadge.vue
|   +-- scheduler/
|       +-- CronExpressionInput.vue
|       +-- ScheduleTaskForm.vue
|       +-- ScheduledTaskList.vue
+-- composables/
|   +-- useTaskBoard.ts
|   +-- useTaskDetail.ts
|   +-- useTasks.ts
|   +-- useScheduler.ts
+-- models/
|   +-- scheduler.ts
|   +-- task.ts
+-- pages/
|   +-- tasks.vue
|   +-- scheduler.vue
+-- services/
|   +-- scheduler.service.ts
|   +-- task.service.ts
+-- server/
|   +-- api/
|   |   +-- tasks/
|   |   +-- schedules/
|   +-- services/
|       +-- scheduler.server.ts
|       +-- task-runner.server.ts
+-- utils/
    +-- groupTasksByStatus.ts
    +-- isValidCronExpression.ts
    +-- taskStatus.ts
```

## Paso 1: Definir contratos de tareas

Crear contratos pequenos y especificos. No usar un unico `TaskPayload` con campos opcionales para todas las operaciones.

Tipos sugeridos:

```ts
export type TaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'scheduled'

export type TaskPriority = 'low' | 'normal' | 'high' | 'critical'

export interface AgentTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedAgentId?: string
  progress: number
  result?: unknown
  error?: string
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  priority: TaskPriority
  assignedAgentId?: string
  input?: Record<string, unknown>
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  priority?: TaskPriority
  assignedAgentId?: string
}
```

Reglas:

- `result` y `input` pueden ser `unknown` o `Record<string, unknown>`, nunca `any`.
- Los estados son union types.
- Los payloads se separan por operacion.

## Paso 2: Crear endpoints de tareas

Endpoints minimos:

```txt
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
POST   /api/tasks/:id/start
POST   /api/tasks/:id/cancel
POST   /api/tasks/:id/retry
GET    /api/tasks/:id/events
```

Responsabilidades del servidor:

- Validar payloads.
- Persistir cambios.
- Emitir eventos realtime.
- Crear logs de auditoria.
- Evitar transiciones de estado invalidas.

Transiciones sugeridas:

```txt
queued -> running
queued -> cancelled
running -> completed
running -> failed
running -> cancelled
failed -> queued
scheduled -> queued
```

Las transiciones deben centralizarse en una utilidad o servicio de dominio, no dispersarse en componentes.

## Paso 3: Servicio de tareas

Crear `task.service.ts` como unica via de comunicacion del frontend con los endpoints de tareas.

Interfaz sugerida:

```ts
export interface TaskService {
  listTasks(filters?: TaskFilters): Promise<AgentTask[]>
  getTask(taskId: string): Promise<AgentTask>
  createTask(payload: CreateTaskPayload): Promise<AgentTask>
  updateTask(taskId: string, payload: UpdateTaskPayload): Promise<AgentTask>
  cancelTask(taskId: string): Promise<AgentTask>
  retryTask(taskId: string): Promise<AgentTask>
}
```

Reglas:

- No guardar estado reactivo en el servicio.
- No usar `fetch` directo.
- No mezclar scheduler con tareas manuales si la logica crece. Mantener `scheduler.service.ts` separado.

## Paso 4: Composable `useTasks`

`useTasks` gestiona lista, carga, errores y operaciones principales.

Debe exponer:

- `tasks`
- `isLoading`
- `error`
- `loadTasks`
- `createTask`
- `updateTask`
- `cancelTask`
- `retryTask`

Si se necesitan mas miembros, evaluar separar en:

- `useTaskActions`
- `useTaskFilters`
- `useTaskRealtime`

Reglas:

- Aceptar `taskService = defaultTaskService`.
- No crear el servicio internamente con `new`.
- No acceder al socket directamente; escuchar eventos mediante `useRealtimeEvents`.

## Paso 5: Agrupar tareas por estado

Crear utilidad pura:

```ts
export function groupTasksByStatus(tasks: AgentTask[]): Record<TaskStatus, AgentTask[]> {
  // Implementacion pura, sin Vue y sin efectos secundarios.
}
```

Reglas:

- Vive en `utils/`.
- No importa `ref`, `computed` ni APIs de Vue.
- Tiene tests unitarios.

## Paso 6: Construir tablero Kanban

Componentes:

- `TaskBoard.vue`: recibe columnas ya agrupadas y emite acciones.
- `TaskColumn.vue`: muestra una columna por estado.
- `TaskCard.vue`: muestra resumen de una tarea.
- `TaskStatusBadge.vue`: representa visualmente el estado.
- `TaskProgressBar.vue`: muestra progreso.

Reglas:

- `TaskCard.vue` no sabe como reintentar una tarea. Solo emite `retry`.
- `TaskColumn.vue` no llama servicios.
- `TaskBoard.vue` no contiene reglas de API.
- La pagina `tasks.vue` orquesta composables y componentes.

Eventos sugeridos:

```txt
create
select
retry
cancel
assign
```

## Paso 7: Formulario de creacion

Crear `CreateTaskForm.vue`.

Campos:

- Titulo.
- Descripcion.
- Prioridad.
- Agente asignado opcional.
- Input JSON opcional.

Responsabilidades:

- Validar campos visuales basicos.
- Emitir payload tipado.
- Mostrar errores de formulario.

No debe:

- Llamar `task.service.ts`.
- Leer agentes desde API.
- Transformar estados de dominio.

Payload emitido:

```ts
export interface CreateTaskFormSubmit {
  payload: CreateTaskPayload
}
```

## Paso 8: Progreso realtime

Eventos necesarios:

```ts
export type TaskRealtimeEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.status.changed'
  | 'task.progress.changed'
  | 'task.completed'
  | 'task.failed'
```

Flujo:

```txt
server task runner
  -> realtime event
  -> realtime.service.ts
  -> useRealtimeEvents.ts
  -> useTasks.ts
  -> TaskBoard.vue
```

Reglas:

- Los eventos deben actualizar tareas por `id`.
- Si llega un evento de tarea desconocida, recargar lista o ignorar con log segun estrategia definida.
- No duplicar tareas en memoria.

## Paso 9: Vista de detalle e historial

Crear `TaskDetailPanel.vue`.

Debe mostrar:

- Datos principales.
- Estado actual.
- Agente asignado.
- Progreso.
- Input.
- Resultado.
- Error.
- Eventos historicos.
- Logs relacionados.

Endpoints:

```txt
GET /api/tasks/:id
GET /api/tasks/:id/events
GET /api/logs?taskId=:id
```

Reglas:

- El panel recibe datos y emite acciones.
- El composable `useTaskDetail` coordina carga de tarea, eventos y logs.
- El resultado grande debe mostrarse colapsado o truncado.

## Paso 10: Scheduler

Crear programacion de tareas con `node-cron` o equivalente.

Contratos:

```ts
export interface ScheduledTask {
  id: string
  taskTemplate: CreateTaskPayload
  cronExpression: string
  enabled: boolean
  nextRunAt?: string
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}

export interface ScheduleTaskPayload {
  taskTemplate: CreateTaskPayload
  cronExpression: string
  enabled: boolean
}
```

Endpoints:

```txt
GET    /api/schedules
POST   /api/schedules
GET    /api/schedules/:id
PATCH  /api/schedules/:id
DELETE /api/schedules/:id
POST   /api/schedules/:id/enable
POST   /api/schedules/:id/disable
```

Reglas:

- Validar expresiones cron en servidor.
- `CronExpressionInput.vue` solo valida y emite valor.
- `scheduler.server.ts` crea tareas, no ejecuta logica de UI.
- Los schedules deben crear logs cuando disparan una tarea.

## Paso 11: Auditoria y logs

Cada cambio importante debe generar log:

- Tarea creada.
- Tarea asignada.
- Tarea iniciada.
- Progreso actualizado.
- Tarea completada.
- Tarea fallida.
- Tarea reintentada.
- Tarea cancelada.
- Schedule creado o modificado.

Formato:

```ts
export interface TaskLogMetadata {
  taskId: string
  previousStatus?: TaskStatus
  nextStatus?: TaskStatus
  assignedAgentId?: string
}
```

## Pruebas minimas

Cubrir:

- `groupTasksByStatus`.
- Validacion de transiciones de estado.
- `useTasks` con servicio mock.
- `useScheduler` con servicio mock.
- `CreateTaskForm` emitiendo payload correcto.
- `TaskCard` emitiendo acciones.
- Endpoints principales de tareas.

Pruebas de integracion recomendadas:

- Crear tarea y verla en el tablero.
- Cambiar estado y recibir evento realtime.
- Reintentar tarea fallida.
- Crear schedule y comprobar proxima ejecucion.

## Criterio de cierre

La fase se considera terminada cuando:

- [ ] Se pueden listar tareas por estado.
- [ ] Se puede crear una tarea manual.
- [ ] Se puede asignar una tarea a un agente.
- [ ] Se puede ver progreso en tiempo real.
- [ ] Se puede cancelar una tarea valida.
- [ ] Se puede reintentar una tarea fallida.
- [ ] Existe vista de detalle con historial.
- [ ] Existe scheduler con cron validado.
- [ ] Cada accion importante genera log.
- [ ] No hay `fetch` directo fuera de servicios.
- [ ] No hay `any`.
- [ ] Los componentes solo reciben props y emiten eventos.
- [ ] Las views no contienen logica de negocio.
- [ ] Los composables aceptan servicios mockeables.

