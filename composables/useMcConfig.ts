export function useMcConfig() {
  const runtimeConfig = useRuntimeConfig()

  return {
    apiBase: computed(() => String(runtimeConfig.public.apiBase ?? '')),
  }
}
