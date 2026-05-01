# Fase 4: Memoria y chat

## Resumen

Duracion estimada: semanas 9-12.

Objetivo: anadir una capa de interaccion directa con agentes y una capa de memoria semantica explorable. Al terminar esta fase, el usuario debe poder conversar con agentes individuales, revisar historiales, buscar contexto por significado, inyectar memoria manualmente y exportar o importar snapshots de memoria.

Esta fase depende de las anteriores: autenticacion, agentes, logs, realtime, tareas y metricas deben estar estabilizados antes de construir experiencias conversacionales y memoria persistente.

## Principios SOLID que gobiernan la fase

- Single Responsibility: el chat gestiona conversaciones, el explorador gestiona memoria, el servicio vectorial gestiona busqueda semantica y los componentes solo presentan datos.
- Open/Closed: nuevas fuentes de memoria, modelos de embedding o proveedores vectoriales deben integrarse extendiendo servicios, no modificando toda la UI.
- Liskov Substitution: componentes de input, mensajes y tarjetas deben respetar atributos, eventos y props esperadas por sus variantes.
- Interface Segregation: separar payloads de busqueda, inyeccion, chat, exportacion e importacion.
- Dependency Inversion: `useMemory` y `useAgentChat` deben aceptar servicios mockeables; la UI no debe depender directamente de pgvector, APIs de IA ni sockets.

## Alcance funcional

- Explorador de memoria semantica.
- Busqueda por texto con similitud vectorial.
- Filtros por agente, fuente, sesion y fecha.
- Visualizacion de contextos relacionados.
- Chat directo con agentes individuales.
- Historial de conversaciones por agente.
- Inyeccion manual de contexto o memoria.
- Exportacion e importacion de snapshots de memoria.
- Eventos realtime para mensajes, memoria creada y actualizaciones de contexto.

## Estructura de archivos objetivo

```txt
app/
+-- components/
|   +-- chat/
|   |   +-- AgentChat.vue
|   |   +-- ChatComposer.vue
|   |   +-- ChatMessageBubble.vue
|   |   +-- ChatMessageList.vue
|   |   +-- ConversationList.vue
|   +-- memory/
|   |   +-- ContextPreview.vue
|   |   +-- MemoryFilters.vue
|   |   +-- MemoryInjectionForm.vue
|   |   +-- MemoryResultCard.vue
|   |   +-- MemorySearchBox.vue
|   |   +-- SnapshotActions.vue
|   +-- vectors/
|       +-- SimilarityBadge.vue
|       +-- VectorMetadataPanel.vue
+-- composables/
|   +-- useAgentChat.ts
|   +-- useConversationHistory.ts
|   +-- useMemory.ts
|   +-- useMemorySnapshots.ts
|   +-- useSemanticSearch.ts
+-- models/
|   +-- chat.ts
|   +-- memory.ts
|   +-- snapshot.ts
|   +-- vector.ts
+-- pages/
|   +-- chat.vue
|   +-- memory.vue
+-- services/
|   +-- chat.service.ts
|   +-- memory.service.ts
|   +-- snapshot.service.ts
|   +-- vector.service.ts
+-- server/
|   +-- api/
|   |   +-- chat/
|   |   +-- memory/
|   |   +-- snapshots/
|   +-- services/
|       +-- chat-orchestrator.server.ts
|       +-- memory-indexer.server.ts
|       +-- vector-store.server.ts
+-- utils/
    +-- formatSimilarity.ts
    +-- normalizeConversation.ts
    +-- truncateContext.ts
    +-- validateSnapshot.ts
```

## Paso 1: Definir contratos de memoria

Crear tipos especificos para memoria, busqueda e inyeccion.

Tipos sugeridos:

```ts
export type MemorySource = 'chat' | 'task' | 'manual' | 'system'

export interface MemoryItem {
  id: string
  agentId: string
  sessionId?: string
  content: string
  source: MemorySource
  embeddingId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface SemanticSearchPayload {
  query: string
  agentId?: string
  sessionId?: string
  source?: MemorySource
  from?: string
  to?: string
  limit: number
}

export interface SemanticSearchResult {
  memory: MemoryItem
  similarity: number
  matchedContext?: string
}

export interface InjectMemoryPayload {
  agentId: string
  sessionId?: string
  content: string
  metadata?: Record<string, unknown>
}
```

Reglas:

- `MemoryItem` no debe incluir logica de embeddings.
- `SemanticSearchPayload` no debe reutilizarse para inyeccion.
- `metadata` debe ser estructurada y segura para serializar.

## Paso 2: Definir contratos de chat

Tipos sugeridos:

```ts
export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  agentId: string
  conversationId: string
  role: ChatRole
  content: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface Conversation {
  id: string
  agentId: string
  title: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface SendChatMessagePayload {
  agentId: string
  conversationId?: string
  content: string
  contextMemoryIds?: string[]
}
```

Reglas:

- El componente de chat no decide como invocar al agente.
- El servidor orquesta agente, memoria y persistencia.
- Los mensajes deben registrarse tambien como fuente posible de memoria.

## Paso 3: Endpoints de memoria

Endpoints minimos:

```txt
GET   /api/memory
POST  /api/memory/search
POST  /api/memory/inject
GET   /api/memory/:id
DELETE /api/memory/:id
```

Responsabilidades del servidor:

- Validar payloads.
- Crear embeddings cuando corresponda.
- Guardar memoria.
- Consultar vector store.
- Registrar logs de busqueda e inyeccion.

Reglas:

- El frontend no conoce pgvector.
- El frontend no genera embeddings.
- El endpoint de busqueda devuelve resultados ya ordenados.

## Paso 4: Servicio vectorial

Crear `vector-store.server.ts` o equivalente.

Responsabilidades:

- Crear embeddings.
- Guardar vectores.
- Ejecutar busqueda por similitud.
- Permitir cambio futuro de proveedor vectorial.

Interfaz sugerida:

```ts
export interface VectorSearchRequest {
  query: string
  filters?: {
    agentId?: string
    sessionId?: string
    source?: MemorySource
  }
  limit: number
}

export interface VectorStore {
  indexMemory(memory: MemoryItem): Promise<void>
  search(request: VectorSearchRequest): Promise<SemanticSearchResult[]>
}
```

Reglas:

- `vector.service.ts` del frontend solo llama API.
- `vector-store.server.ts` contiene detalles de pgvector.
- El proveedor de embeddings se configura, no se codifica dentro de componentes.

## Paso 5: Composable `useMemory`

Gestiona busqueda, filtros, loading, error e inyeccion.

Debe exponer:

- `results`
- `filters`
- `isSearching`
- `error`
- `search`
- `injectMemory`
- `clearResults`

Si se vuelve demasiado grande, dividir:

- `useSemanticSearch`
- `useMemoryInjection`
- `useMemoryFilters`

Reglas:

- Aceptar `memoryService = defaultMemoryService`.
- No llamar `fetch`.
- No importar APIs de vector store.
- No exponer mas estado del necesario.

## Paso 6: Explorador de memoria

Crear vista `memory.vue`.

Componentes:

- `MemorySearchBox.vue`
- `MemoryFilters.vue`
- `MemoryResultCard.vue`
- `ContextPreview.vue`
- `MemoryInjectionForm.vue`
- `SnapshotActions.vue`

Flujo:

```txt
Usuario escribe query
  -> MemorySearchBox emite search
  -> memory.vue llama useMemory.search
  -> memory.service.ts llama /api/memory/search
  -> servidor consulta vector store
  -> results se pasan a MemoryResultCard
```

Reglas:

- La busqueda no vive dentro del componente visual.
- Las tarjetas de resultado no conocen endpoints.
- El preview de contexto recibe texto ya preparado.

## Paso 7: Inyeccion manual de memoria

Crear `MemoryInjectionForm.vue`.

Campos:

- Agente.
- Sesion opcional.
- Contenido.
- Metadata opcional.

Endpoint:

```txt
POST /api/memory/inject
```

Payload:

```ts
export interface InjectMemoryPayload {
  agentId: string
  sessionId?: string
  content: string
  metadata?: Record<string, unknown>
}
```

Reglas:

- Validar longitud minima y maxima del contenido.
- Sanitizar metadata.
- Registrar log de auditoria.
- Emitir evento realtime `memory.created`.

## Paso 8: Endpoints de chat

Endpoints minimos:

```txt
GET   /api/chat/conversations
POST  /api/chat/conversations
GET   /api/chat/conversations/:id/messages
POST  /api/chat/:agentId/messages
```

Responsabilidades del servidor:

- Crear conversacion si no existe.
- Guardar mensaje de usuario.
- Recuperar contexto relevante.
- Invocar agente.
- Guardar respuesta.
- Indexar memoria si procede.
- Emitir eventos realtime.

Eventos:

```ts
export type ChatRealtimeEventType =
  | 'chat.message.created'
  | 'chat.message.streaming'
  | 'chat.message.completed'
  | 'memory.created'
```

## Paso 9: Composable `useAgentChat`

Gestiona conversacion activa, mensajes, envio y streaming.

Debe exponer:

- `conversation`
- `messages`
- `isSending`
- `isStreaming`
- `error`
- `loadConversation`
- `sendMessage`

Reglas:

- Aceptar `chatService = defaultChatService`.
- No gestionar memoria directamente; delegar a servicios o composables especificos.
- No suscribirse al socket desde componentes.

## Paso 10: UI de chat

Crear componentes:

- `ConversationList.vue`
- `AgentChat.vue`
- `ChatMessageList.vue`
- `ChatMessageBubble.vue`
- `ChatComposer.vue`

Responsabilidades:

- `ConversationList.vue`: seleccionar conversacion.
- `AgentChat.vue`: layout del chat y orquestacion visual.
- `ChatMessageList.vue`: renderizar mensajes.
- `ChatMessageBubble.vue`: presentar mensaje.
- `ChatComposer.vue`: capturar texto y emitir submit.

Reglas:

- `ChatComposer.vue` no llama API.
- `ChatMessageBubble.vue` no transforma markdown complejo si no hay utilidad dedicada.
- Los eventos de envio deben estar tipados.
- El input debe ser accesible por teclado.

## Paso 11: Snapshots de memoria

Permitir exportar e importar memoria.

Contratos:

```ts
export interface MemorySnapshot {
  id: string
  version: string
  agentId?: string
  itemCount: number
  createdAt: string
}

export interface ExportMemorySnapshotPayload {
  agentId?: string
  from?: string
  to?: string
}

export interface ImportMemorySnapshotPayload {
  snapshotVersion: string
  items: MemoryItem[]
}
```

Endpoints:

```txt
POST /api/snapshots/export
POST /api/snapshots/import
GET  /api/snapshots
GET  /api/snapshots/:id
```

Reglas:

- Validar version del snapshot.
- No importar memoria sin agente valido.
- Registrar auditoria de importacion y exportacion.
- No bloquear la UI si la exportacion es grande; considerar job asincrono si crece.

## Paso 12: Seguridad y privacidad

Controles obligatorios:

- Solo usuarios autorizados pueden ver memoria.
- La inyeccion manual requiere rol adecuado.
- Los snapshots deben filtrarse por permisos.
- No exponer embeddings crudos salvo que sea una vista explicita de depuracion.
- Sanitizar contenido antes de renderizarlo.
- Registrar auditoria para busquedas, inyecciones, importaciones y exportaciones.

Reglas:

- Secrets de modelos o embeddings solo en servidor.
- El frontend nunca llama directamente a proveedores de IA.
- El contenido importado debe validarse antes de persistirse.

## Pruebas minimas

Cubrir:

- `useMemory` con servicio mock.
- `useSemanticSearch` con filtros.
- `useAgentChat` con mensajes y streaming mock.
- `MemoryInjectionForm` emitiendo payload correcto.
- `ChatComposer` emitiendo submit accesible.
- `validateSnapshot`.
- Endpoints de busqueda, inyeccion y chat.

Pruebas de integracion recomendadas:

- Inyectar memoria y encontrarla por busqueda.
- Enviar mensaje a agente y guardar historial.
- Recuperar contexto relevante antes de responder.
- Exportar snapshot e importarlo en entorno limpio.

## Criterio de cierre

La fase se considera terminada cuando:

- [ ] Se puede buscar memoria semantica por texto.
- [ ] Se puede filtrar memoria por agente, fuente, sesion y fecha.
- [ ] Se puede inyectar memoria manualmente.
- [ ] El chat permite conversar con agentes individuales.
- [ ] El historial de conversaciones queda persistido.
- [ ] Los mensajes pueden generar memoria si aplica.
- [ ] Se pueden exportar e importar snapshots.
- [ ] Las operaciones sensibles generan logs.
- [ ] El frontend no conoce pgvector ni proveedores de IA.
- [ ] No hay `fetch` directo fuera de servicios.
- [ ] No hay `any`.
- [ ] Los componentes son presentacionales.
- [ ] Los composables son pequenos, testeables e inyectables.

