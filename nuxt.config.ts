// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    openclawBridgeMode: process.env.OPENCLAW_BRIDGE_MODE ?? 'mock',
    openclawGatewayUrl: process.env.OPENCLAW_GATEWAY_URL ?? '',
    openclawGatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN ?? '',
    databasePath: process.env.DATABASE_PATH ?? './data/mission-control.db',
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
