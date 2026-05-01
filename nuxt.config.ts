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
    openclawGatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN ?? '',
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
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
    },
  },

  nitro: {
    experimental: {
      websocket: true,
    },
    rollupConfig: {
      external: ['better-sqlite3'],
    },
  },
})
