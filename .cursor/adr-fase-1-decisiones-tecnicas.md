# ADR Fase 1: Decisiones tecnicas

## Estado

Aceptada.

## Contexto

OpenClaw Mission Control sera un dashboard de observabilidad y control para agentes de IA. La Fase 1 debe crear la base tecnica del sistema y permitir una primera conexion real con agentes expuestos por OpenClaw mediante API.

El proyecto debe incluir frontend, backend, base de datos y puente de integracion con OpenClaw en el mismo repositorio. La arquitectura debe seguir las reglas definidas en `solid.md`: separacion estricta entre `models/`, `services/`, `composables/`, `views/`, `components/` y `utils/`.

## Objetivo de la Fase 1

Construir una infraestructura local funcional con Nuxt 3, Nitro, SQLite, Drizzle ORM, WebSocket y una primera capa de integracion con OpenClaw.

La Fase 1 no se limita a preparar pantallas vacias. Debe permitir:

- Conectar con agentes reales de OpenClaw mediante API.
- Observar eventos principales de agentes.
- Enviar comandos minimos hacia agentes.
- Persistir eventos importantes y errores.
- Dejar una base compatible con la futura migracion a Postgres.

## Decisiones

### 1. Alcance inicial

La Fase 1 incluye infraestructura base y conexion inicial con agentes reales.

Incluye:

- Setup Nuxt 3.
- Layout principal.
- API Nitro.
- Base de datos SQLite.
- Drizzle ORM.
- WebSocket.
- Logger centralizado.
- Puente con OpenClaw.
- Comandos minimos hacia agentes.

No incluye todavia:

- Dashboard completo de metricas.
- Kanban de tareas completo.
- Memoria semantica.
- Chat avanzado.
- Despliegue productivo.

### 2. Ubicacion del proyecto

El repositorio incluira todo lo necesario para el MVP:

- Frontend Nuxt 3.
- Backend Nitro.
- Base de datos local.
- Servicios de dominio.
- Puente de integracion con OpenClaw.
- Contratos TypeScript compartidos.

Decision: no separar frontend y backend en repositorios distintos durante el MVP.

Motivo:

- Reduce friccion inicial.
- Permite iterar rapido.
- Facilita compartir modelos entre frontend y servidor.
- Encaja con Nuxt 3 y Nitro.

### 3. Integracion con OpenClaw

OpenClaw expone los agentes mediante API.

Mission Control no debe acoplar sus componentes ni composables directamente a esa API. Se creara una capa puente en servidor.

Flujo:

```txt
Frontend Nuxt
  -> services/
  -> Nitro API
  -> OpenClaw bridge
  -> OpenClaw API
```

Responsabilidades del puente:

- Traducir respuestas de OpenClaw al modelo interno.
- Normalizar errores.
- Emitir eventos internos.
- Registrar logs relevantes.
- Encapsular credenciales o configuracion sensible.

### 4. Control de agentes desde Fase 1

El dashboard no solo observara agentes. Tambien debe poder enviar comandos minimos desde Fase 1.

Comandos iniciales recomendados:

- Consultar estado de agente.
- Iniciar una accion simple.
- Cancelar o detener una accion si OpenClaw lo soporta.
- Solicitar health/status.

Los comandos deben pasar siempre por Nitro. El frontend nunca llama directamente a OpenClaw.

Endpoint interno sugerido:

```txt
POST /api/openclaw/agents/:agentId/commands
```

Payload sugerido:

```ts
export type AgentCommandType =
  | 'status.refresh'
  | 'action.start'
  | 'action.cancel'
  | 'health.check'

export interface SendAgentCommandPayload {
  command: AgentCommandType
  input?: Record<string, unknown>
}
```

### 5. Realtime

Se usara WebSocket desde Fase 1.

Motivo:

- El sistema necesita observar eventos.
- El sistema tambien enviara comandos.
- WebSocket encaja mejor con comunicacion bidireccional.
- Evita migrar desde SSE cuando aparezca control activo.

Regla:

- Los componentes no se conectan directamente al socket.
- La conexion vive en `realtime.service.ts`.
- El estado reactivo vive en `useRealtimeEvents.ts`.
- Los componentes reciben datos por props y emiten eventos.

### 6. Base de datos

Se usara SQLite durante Fase 1.

Motivo:

- Facilita desarrollo local.
- No requiere infraestructura externa.
- Permite validar dominio antes de desplegar.

Pero la arquitectura debe ser compatible con Postgres desde el inicio.

Reglas:

- Usar Drizzle ORM.
- Evitar SQL especifico de SQLite en servicios.
- Definir IDs consistentes.
- Normalizar fechas.
- Mantener schema y modelos separados.
- Documentar migracion futura a Postgres.

Decision futura esperada:

- Postgres sera necesario cuando se active memoria semantica con `pgvector` en Fase 4.

### 7. Persistencia de logs

No se persistiran todos los logs crudos desde Fase 1.

Se persistiran eventos importantes:

- Cambios de estado de agente.
- Errores.
- Comandos enviados.
- Respuestas relevantes de comandos.
- Eventos de sistema.
- Fallos de comunicacion con OpenClaw.

Motivo:

- Evita ruido temprano.
- Reduce crecimiento innecesario de SQLite.
- Mantiene el modelo simple.
- Permite ampliar a raw logs mas adelante si hace falta.

Tabla o modelo base:

```ts
export interface LogEntry {
  id: string
  agentId?: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
}
```

### 8. Formato interno de eventos

Mission Control definira su propio contrato interno de eventos.

Motivo:

- Evita acoplar la UI al formato de OpenClaw.
- Permite evolucionar Mission Control aunque cambie OpenClaw.
- Facilita testing.
- Permite integrar otras fuentes futuras.

Contrato base:

```ts
export type MissionControlEventType =
  | 'agent.status.changed'
  | 'agent.command.sent'
  | 'agent.command.completed'
  | 'agent.command.failed'
  | 'log.created'
  | 'system.health.changed'

export interface MissionControlEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MissionControlEventType
  payload: TPayload
  createdAt: string
}
```

El puente OpenClaw sera responsable de traducir cualquier respuesta externa a este contrato interno.

### 9. Autenticacion

No se implementara autenticacion activa al inicio.

La Fase 1 se ejecutara en entorno local.

Motivo:

- Acelera validacion del puente con OpenClaw.
- Reduce complejidad inicial.
- Evita bloquear la integracion por decisiones de auth.

Pero se modelaran roles desde el inicio:

```ts
export type UserRole = 'admin' | 'operator' | 'viewer'
```

Esto permite activar permisos mas adelante sin rehacer los contratos.

### 10. UI

Se creara un sistema propio con Tailwind CSS y componentes base.

Componentes base iniciales:

- `BaseButton.vue`
- `BaseInput.vue`
- `BaseCard.vue`
- `BaseBadge.vue`
- `BaseModal.vue`

Reglas:

- Los componentes base no conocen dominios.
- Si envuelven HTML nativo, deben reenviar atributos con `v-bind="$attrs"`.
- Deben mantener eventos estables.
- No deben llamar servicios.

### 11. Testing

Se incluira Vitest desde Fase 1.

Cobertura inicial recomendada:

- `utils/`.
- `services/`.
- `composables/`.
- adaptadores del puente OpenClaw.
- normalizacion de eventos.

E2E queda para fases posteriores.

Motivo:

- El proyecto depende de capas desacopladas.
- Los servicios y composables deben ser mockeables.
- El puente OpenClaw necesita tests para no romper el contrato interno.

### 12. Despliegue

Durante el MVP, el proyecto se ejecutara en local.

No se decidira despliegue productivo hasta validar:

- Conexion con OpenClaw.
- WebSocket.
- Persistencia local.
- Primeros comandos.
- Estabilidad del modelo de eventos.

Opciones futuras:

- VPS con Docker.
- Vercel compatible con Nitro, si encaja con WebSocket.
- Kubernetes mas adelante si el proyecto crece.

### 13. Gestor de paquetes

Se usara `npm`.

Motivo:

- Decision explicita del proyecto.
- Reduce variabilidad entre entornos.
- Evita introducir otro gestor antes de validar el MVP.

## Estructura inicial recomendada

```txt
app/
+-- components/
|   +-- base/
|   +-- agents/
|   +-- logs/
+-- composables/
|   +-- useOpenClawAgents.ts
|   +-- useRealtimeEvents.ts
|   +-- useSystemLogs.ts
+-- models/
|   +-- agent.ts
|   +-- event.ts
|   +-- log.ts
|   +-- openclaw.ts
|   +-- user.ts
+-- pages/
|   +-- index.vue
|   +-- agents.vue
|   +-- logs.vue
+-- services/
|   +-- api-client.service.ts
|   +-- openclaw-agent.service.ts
|   +-- realtime.service.ts
|   +-- log.service.ts
+-- server/
|   +-- api/
|   |   +-- openclaw/
|   |   +-- logs/
|   |   +-- realtime/
|   |   +-- health.get.ts
|   +-- db/
|   |   +-- client.ts
|   |   +-- schema.ts
|   |   +-- migrations/
|   +-- services/
|       +-- openclaw-bridge.server.ts
|       +-- logger.server.ts
+-- utils/
    +-- normalizeEvent.ts
    +-- formatDate.ts
    +-- severity.ts
```

## Contratos iniciales prioritarios

### Agente

```ts
export type AgentStatus = 'idle' | 'running' | 'error' | 'offline'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  model?: string
  currentAction?: string
  tokenUsage?: number
  lastSeenAt?: string
}
```

### Comando

```ts
export type AgentCommandType =
  | 'status.refresh'
  | 'action.start'
  | 'action.cancel'
  | 'health.check'

export interface AgentCommand {
  id: string
  agentId: string
  command: AgentCommandType
  input?: Record<string, unknown>
  status: 'queued' | 'sent' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
}
```

### Evento

```ts
export interface MissionControlEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MissionControlEventType
  payload: TPayload
  createdAt: string
}
```

## Consecuencias

### Positivas

- La UI queda desacoplada de OpenClaw.
- El proyecto puede evolucionar sin separar repositorios demasiado pronto.
- WebSocket permite observabilidad y control desde el inicio.
- SQLite acelera desarrollo local.
- Drizzle reduce el coste futuro de migrar a Postgres.
- Los tests pueden cubrir la logica importante sin depender de red real.

### Costes

- Habra que mantener una capa puente entre Mission Control y OpenClaw.
- WebSocket exige algo mas de disciplina que SSE.
- La ausencia inicial de auth obliga a recordar que el sistema es solo local.
- La migracion a Postgres debera planificarse antes de Fase 4.

### Riesgos

- Si la API de OpenClaw cambia con frecuencia, el puente necesitara adaptadores robustos.
- Si se guardan pocos logs, puede faltar detalle para depurar algunos fallos tempranos.
- Si se aplaza demasiado la auth, puede haber que revisar endpoints antes de desplegar.
- Si se usan detalles especificos de SQLite por accidente, la migracion a Postgres sera mas costosa.

## Pendientes

- Confirmar endpoints reales disponibles en OpenClaw.
- Confirmar formato actual de respuestas de OpenClaw.
- Definir comandos minimos soportados por agente.
- Definir estrategia de reconexion WebSocket.
- Decidir si los eventos se guardan en tabla separada o solo como logs durante Fase 1.
- Documentar migracion SQLite -> Postgres antes de iniciar Fase 4.
- Definir autenticacion antes de cualquier despliegue fuera de local.

## Criterio de aceptacion del ADR

Este ADR se considera aplicado cuando:

- [ ] Existe puente Nitro hacia OpenClaw.
- [ ] La UI no llama directamente a OpenClaw.
- [ ] Existen contratos internos para agentes, comandos, logs y eventos.
- [ ] WebSocket transmite eventos internos.
- [ ] SQLite persiste logs relevantes.
- [ ] Los servicios no usan `fetch` directo fuera del cliente API.
- [ ] Los composables aceptan servicios mockeables.
- [ ] No hay `any` en los contratos principales.
- [ ] El proyecto arranca localmente con `npm`.

