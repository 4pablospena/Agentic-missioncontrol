// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', 'nuxt-auth-utils'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: ['~/assets/css/main.css'],

  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },

  runtimeConfig: {
    openclawBridgeMode: process.env.OPENCLAW_BRIDGE_MODE ?? 'mock',
    openclawGatewayUrl: process.env.OPENCLAW_GATEWAY_URL ?? '',
    openclawGatewayWs: process.env.OPENCLAW_GATEWAY_WS ?? '',
    openclawGatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN ?? '',
    openclawGatewayClientId: process.env.OPENCLAW_GATEWAY_CLIENT_ID ?? '',
    openclawGatewayClientMode: process.env.OPENCLAW_GATEWAY_CLIENT_MODE ?? '',
    /** Comma-separated `connect` scopes (default operator.read,operator.write). E.g. `operator.admin`. */
    openclawGatewayScopes: process.env.OPENCLAW_GATEWAY_SCOPES ?? '',
    /** Gateway `connect` role when non-empty (default operator). */
    openclawGatewayRole: process.env.OPENCLAW_GATEWAY_ROLE ?? '',
    /** When `true`, omit `scopes` from WS `connect` (try if gateway infers grants). */
    openclawGatewayOmitConnectScopes: process.env.OPENCLAW_GATEWAY_OMIT_CONNECT_SCOPES ?? '',
    /** `Authorization: Bearer` on WebSocket upgrade. */
    openclawGatewayWsBearer: process.env.OPENCLAW_GATEWAY_WS_BEARER ?? '',
    /**
     * Host OpenClaw dir (~/.openclaw). When set, `/api/openclaw/agents` falls back to reading
     * `openclaw.json` if the gateway bridge fails (TenacitOS-style discovery).
     */
    openclawDir: process.env.OPENCLAW_DIR ?? '',
    databasePath: process.env.DATABASE_PATH ?? './data/mission-control.db',
    /**
     * Operator login (server-only). Override at runtime with env:
     * - `NUXT_MC_AUTH_EMAIL`, `NUXT_MC_AUTH_PASSWORD`, `NUXT_MC_AUTH_PASSWORD_HASH`
     * Legacy process-only vars still read in login handler: `MISSION_CONTROL_OPERATOR_*`.
     */
    mcAuth: {
      email: '',
      password: '',
      passwordHash: '',
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD ?? '',
    },
    /** Phase 4: embeddings / semantic memory (server-only). */
    memoryEmbeddingApiUrl: process.env.NUXT_MEMORY_EMBEDDING_API_URL ?? '',
    memoryEmbeddingApiKey: process.env.NUXT_MEMORY_EMBEDDING_API_KEY ?? '',
    memoryEmbeddingModel: process.env.NUXT_MEMORY_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    memoryEmbeddingDimensions:
      Number.parseInt(process.env.NUXT_MEMORY_EMBEDDING_DIMENSIONS ?? '256', 10) || 256,
    memorySearchMaxScan:
      Number.parseInt(process.env.NUXT_MEMORY_SEARCH_MAX_SCAN ?? '5000', 10) || 5000,
    memoryEmbedChatTurns: process.env.NUXT_MEMORY_EMBED_CHAT_TURNS === 'true',
    memoryChatRecentMessages:
      Number.parseInt(process.env.NUXT_MEMORY_CHAT_RECENT_MESSAGES ?? '40', 10) || 40,
    memorySemanticContextLimit:
      Number.parseInt(process.env.NUXT_MEMORY_SEMANTIC_CONTEXT_LIMIT ?? '5', 10) || 5,
    /**
     * Phase 5: workspace browser root (server-only).
     * When empty the read-only filesystem endpoints return 503 and the UI hides the route.
     * Set via `NUXT_WORKSPACE_ROOT` to an absolute path you trust to be served read-only.
     */
    workspaceRoot: process.env.NUXT_WORKSPACE_ROOT ?? '',
    /**
     * Directory for uploaded operator avatars (server-only). Default `./data/avatars` when unset.
     * Relative paths resolve from `process.cwd()` (same as DATABASE_PATH).
     */
    avatarUploadDir: process.env.NUXT_AVATAR_UPLOAD_DIR ?? '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      office3dEnabled: process.env.NUXT_PUBLIC_OFFICE3D_ENABLED === 'true',
      advancedAnalyticsEnabled: process.env.NUXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED === 'true',
      /**
       * Hides the Diagnostics route (sidebar entry, command palette, Overview footer button)
       * and serves a 404 from `/diagnostics` when set to `false`. Default `true` so local
       * dev keeps full visibility; flip to `false` in production deployments.
       */
      showDiagnostics: process.env.NUXT_PUBLIC_SHOW_DIAGNOSTICS !== 'false',
      /**
       * Mirrors the server-only `workspaceRoot` as a boolean flag. The UI uses this to
       * gate the Workspace nav entry and command palette item without leaking the path.
       */
      workspaceEnabled: !!(process.env.NUXT_WORKSPACE_ROOT ?? '').trim(),
    },
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'DENY',
          'referrer-policy': 'strict-origin-when-cross-origin',
        },
      },
    },
    experimental: {
      websocket: true,
    },
    rollupConfig: {
      external: ['better-sqlite3'],
    },
  },
})
