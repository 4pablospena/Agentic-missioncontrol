<script setup lang="ts">
const colorMode = useColorMode()

const themeColor = computed(() =>
  colorMode.value === 'dark' ? '#18181b' : '#ffffff',
)

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: themeColor },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

const title = 'OpenClaw Mission Control'
const description = 'Dashboard de observabilidad y control para agentes de IA (Nuxt UI Dashboard template pattern).'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
