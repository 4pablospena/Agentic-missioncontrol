# Fase 1: Infraestructura base

## Resumen

Duracion estimada: semanas 1-2.

Objetivo: dejar preparada la base tecnica de OpenClaw Mission Control para construir un dashboard Nuxt 3 mantenible, testeable y alineado con SOLID. Esta fase no debe buscar completar todos los modulos, sino crear las capas, contratos y flujos minimos sobre los que se apoyaran observabilidad, tareas, memoria y chat.

El resultado debe ser una aplicacion Nuxt 3 funcional con autenticacion, layout principal, API Nitro, base de datos, logging centralizado y canal realtime basico.

## Principios SOLID que gobiernan la fase

- Single Responsibility: cada carpeta tiene una responsabilidad clara. `models/` define contratos, `services/` comunica con APIs, `composables/` gestiona estado y reglas de dominio, `views/` orquesta, `components/` presenta y `utils/` contiene funciones puras.
- Open/Closed: las abstracciones base, como cliente HTTP, logger y realtime client, deben admitir configuracion sin modificarse cada vez que aparezca un nuevo modulo.
- Liskov Substitution: los componentes base que envuelvan HTML nativo deben reenviar atributos y mantener eventos estables.
- Interface Segregation: los tipos iniciales deben ser pequenos y especificos. Evitar payloads genericos con muchos campos opcionales.
- Dependency Inversion: los servicios deben depender de un cliente HTTP/configurable, no de `fetch` directo ni de variables de entorno leidas en cualquier sitio.

## Alcance funcional

- Crear proyecto con Nuxt 3, Vue 3, TypeScript y Tailwind CSS.
- Definir layouts principales: publico, autenticado y dashboard.
- Configurar autenticacion con Nuxt Auth Utils.
- Crear rutas base de API usando Nitro server routes.
- Configurar Drizzle ORM con SQLite para desarrollo local y una ruta clara hacia Postgres.
- Crear modelos base para agentes, logs, tareas, eventos realtime y usuario.
- Implementar logger centralizado para registrar eventos de sistema y agentes.
- Implementar canal realtime basico con WebSocket o SSE.
- Crear vistas placeholder para dashboard, agentes, logs, tareas, memoria y chat.

## Estructura de archivos objetivo

```txt
app/
+-- components/
|   +-- base/
|   |   +-- BaseButton.vue
|   |   +-- BaseInput.vue
|   |   +-- BaseCard.vue
|   +-- dashboard/
|   +-- agents/
|   +-- logs/
|   +-- tasks/
|   +-- memory/
|   +-- chat/
+-- composables/
|   +-- useAuthSession.ts
|   +-- useAppConfig.ts
|   +-- useRealtimeEvents.ts
|   +-- useSystemLogs.ts
+-- layouts/
|   +-- default.vue
|   +-- public.vue
|   +-- dashboard.vue
+-- models/
|   +-- agent.ts
|   +-- auth.ts
|   +-- log.ts
|   +-- realtime.ts
|   +-- task.ts
|   +-- user.ts
+-- pages/
|   +-- index.vue
|   +-- login.vue
|   +-- agents.vue
|   +-- logs.vue
|   +-- tasks.vue
|   +-- memory.vue
|   +-- chat.vue
+-- services/
|   +-- api-client.service.ts
|   +-- auth.service.ts
|   +-- log.service.ts
|   +-- realtime.service.ts
+-- server/
|   +-- api/
|   |   +-- auth/
|   |   +-- agents/
|   |   +-- logs/
|   |   +-- realtime/
|   |   +-- health.get.ts
|   +-- db/
|   |   +-- client.ts
|   |   +-- schema.ts
|   |   +-- migrations/
|   +-- services/
|       +-- logger.server.ts
+-- utils/
    +-- formatDate.ts
    +-- parseJsonSafe.ts
    +-- severity.ts
```

## Paso 1: Crear base Nuxt 3

1. Crear el proyecto Nuxt 3 con TypeScript.
2. Instalar y configurar Tailwind CSS.
3. Activar reglas estrictas de TypeScript.
4. Crear layout `dashboard.vue` con sidebar, header y area principal.
5. Crear paginas placeholder para cada modulo del plan.

Resultado esperado:

- La app arranca localmente.
- Hay navegacion basica entre modulos.
- No hay logica de negocio dentro de componentes visuales.

Checklist SOLID:

- [ ] `pages/` solo selecciona layout y compone vistas.
- [ ] `components/base/` no conoce dominios como agentes, logs o tareas.
- [ ] Ningun componente llama a APIs.

## Paso 2: Configuracion centralizada

Crear una abstraccion para configuracion runtime. Ningun modulo debe leer `import.meta.env` directamente.

Contrato sugerido:

```ts
export interface AppRuntimeConfig {
  apiBaseUrl: string
  realtimeUrl: string
  authSecretSet: boolean
  databaseProvider: 'sqlite' | 'postgres'
}
```

Implementacion esperada:

- `useAppConfig.ts` para frontend.
- `server/utils/runtime-config.ts` o equivalente para servidor.
- Validacion temprana de variables obligatorias.

Reglas:

- Las credenciales no se exponen al frontend.
- El frontend solo recibe valores publicos.
- Si falta una variable critica, el fallo debe ser claro y temprano.

## Paso 3: Crear cliente API reusable

Crear un servicio base para llamadas HTTP. Los servicios de dominio deben usar esta abstraccion.

Responsabilidades:

- Resolver `baseURL`.
- Normalizar errores.
- Adjuntar headers necesarios.
- Exponer metodos genericos: `get`, `post`, `patch`, `delete`.

No debe:

- Conocer agentes, tareas, memoria o chat.
- Guardar estado reactivo.
- Leer variables de entorno directamente.

Ejemplo de interfaz:

```ts
export interface ApiClient {
  get<TResponse>(path: string): Promise<TResponse>
  post<TPayload, TResponse>(path: string, payload: TPayload): Promise<TResponse>
  patch<TPayload, TResponse>(path: string, payload: TPayload): Promise<TResponse>
  delete<TResponse>(path: string): Promise<TResponse>
}
```

## Paso 4: Autenticacion base

Implementar autenticacion con Nuxt Auth Utils.

Pasos:

1. Definir modelo `AuthUser`.
2. Crear endpoints de login, logout y session.
3. Crear composable `useAuthSession`.
4. Proteger layout dashboard con middleware.
5. Redirigir usuarios anonimos a login.

Tipos sugeridos:

```ts
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
}
```

Checklist:

- [ ] Las credenciales nunca se guardan en frontend.
- [ ] El componente de login solo emite submit.
- [ ] `useAuthSession` no llama a `fetch` directo.
- [ ] Los roles quedan tipados desde el principio.

## Paso 5: Base de datos y Drizzle ORM

Crear schema inicial para las entidades que seran compartidas por las siguientes fases.

Tablas minimas:

- `users`
- `agents`
- `logs`
- `realtime_events`
- `tasks`

Campos minimos de `agents`:

```ts
export interface Agent {
  id: string
  name: string
  status: 'idle' | 'running' | 'error' | 'offline'
  model: string
  currentTaskId?: string
  tokenUsage: number
  lastSeenAt: string
  createdAt: string
  updatedAt: string
}
```

Campos minimos de `logs`:

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

Reglas:

- `models/` contiene los contratos compartidos.
- `server/db/schema.ts` contiene el schema Drizzle.
- Las transformaciones entre DB y modelo se hacen en servicios de servidor, no en componentes.

## Paso 6: Logging centralizado

Crear `logger.server.ts` como servicio de servidor.

Responsabilidades:

- Registrar eventos internos.
- Registrar eventos por agente.
- Normalizar severidad.
- Permitir metadata estructurada.
- Guardar en base de datos.

Interfaz sugerida:

```ts
export interface CreateLogPayload {
  agentId?: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata?: Record<string, unknown>
}

export interface LoggerService {
  create(payload: CreateLogPayload): Promise<LogEntry>
}
```

Endpoints iniciales:

```txt
GET  /api/logs
POST /api/logs
GET  /api/health
```

## Paso 7: Realtime basico

Elegir WebSocket o SSE. Para esta fase basta con eventos simulados o eventos del sistema.

Evento base:

```ts
export type RealtimeEventType =
  | 'agent.status.changed'
  | 'log.created'
  | 'task.status.changed'
  | 'system.health.changed'

export interface RealtimeEvent<TPayload = Record<string, unknown>> {
  id: string
  type: RealtimeEventType
  payload: TPayload
  createdAt: string
}
```

Responsabilidades:

- `realtime.service.ts` gestiona conexion.
- `useRealtimeEvents.ts` gestiona estado reactivo.
- Los componentes reciben eventos ya procesados por props.

Checklist:

- [ ] El servicio realtime no depende de componentes.
- [ ] El composable admite inyeccion de servicio para tests.
- [ ] Los eventos estan tipados.

## Paso 8: Pruebas minimas

Cubrir al menos:

- `api-client.service.ts`
- `useAuthSession.ts`
- `useRealtimeEvents.ts`
- `logger.server.ts`
- utilidades puras de `utils/`

Tipos de prueba:

- Unit tests para utils.
- Unit tests de composables con servicios mockeados.
- Tests de endpoints Nitro principales.

## Criterio de cierre

La fase se considera terminada cuando:

- [ ] La app Nuxt arranca sin errores.
- [ ] Existe layout autenticado y navegacion principal.
- [ ] El login crea y cierra sesion.
- [ ] Existen endpoints Nitro base.
- [ ] Drizzle tiene schema inicial y migracion local.
- [ ] Los logs se pueden crear y listar.
- [ ] Hay canal realtime conectado o simulado.
- [ ] No hay `any`.
- [ ] No hay `fetch` directo fuera de `services/`.
- [ ] No hay lecturas directas de `import.meta.env` fuera de configuracion.
- [ ] Los componentes base reenvian atributos cuando envuelven HTML nativo.

