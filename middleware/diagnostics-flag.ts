/**
 * Route guard for `/diagnostics`. When the runtime flag
 * `NUXT_PUBLIC_SHOW_DIAGNOSTICS=false` is set, the route serves a 404 even if
 * a user types the URL directly — belt + suspenders alongside the sidebar /
 * command-palette / Overview-footer gates in `layouts/dashboard.vue` and
 * `pages/index.vue`.
 */
export default defineNuxtRouteMiddleware(() => {
  const { public: publicConfig } = useRuntimeConfig()

  if (publicConfig.showDiagnostics === false) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      fatal: true,
    })
  }
})
