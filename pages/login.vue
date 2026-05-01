<script setup lang="ts">
definePageMeta({ layout: 'public' })

const auth = useAuthSession()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const pending = ref(false)

async function onSubmit() {
  errorMsg.value = ''
  pending.value = true
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    await navigateTo('/')
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string }; statusMessage?: string }
    errorMsg.value =
      err?.data?.message ?? err?.statusMessage ?? 'Could not sign in'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="space-y-1">
        <h1 class="text-highlighted text-lg font-semibold">
          Sign in
        </h1>
        <p class="text-muted text-sm">
          OpenClaw Mission Control — operator session
        </p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <UAlert
        v-if="errorMsg"
        color="error"
        variant="soft"
        :title="errorMsg"
      />

      <UFormField label="Email">
        <UInput
          v-model="email"
          type="email"
          name="email"
          autocomplete="username"
          required
          placeholder="operator@example.com"
        />
      </UFormField>

      <UFormField label="Password">
        <UInput
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
        />
      </UFormField>

      <UButton
        type="submit"
        block
        :loading="pending"
      >
        Continue
      </UButton>
    </form>
  </UCard>
</template>
