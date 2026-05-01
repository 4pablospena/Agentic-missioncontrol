<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

definePageMeta({ layout: 'public' })

const auth = useAuthSession()

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'operator@example.com',
    required: true,
    autocomplete: 'username',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    required: true,
    autocomplete: 'current-password',
  },
]

/** Matches server/api/auth/login.post.ts (min 1). Tighten to min(8) for stricter UX later. */
const loginFormSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormOutput = z.output<typeof loginFormSchema>

const errorMsg = ref('')
const pending = ref(false)

async function onSubmit(payload: FormSubmitEvent<LoginFormOutput>) {
  errorMsg.value = ''
  pending.value = true
  try {
    await auth.login({
      email: payload.data.email.trim(),
      password: payload.data.password,
    })
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
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="loginFormSchema"
      title="Login"
      description="Enter your credentials to access your account."
      icon="i-lucide-user"
      :fields="fields"
      :submit="{
        label: 'Submit',
        color: 'error',
        variant: 'subtle',
      }"
      :loading="pending"
      class="w-full"
      @submit="onSubmit"
    >
      <template #validation>
        <UAlert
          v-if="errorMsg"
          color="error"
          variant="soft"
          :title="errorMsg"
        />
      </template>

      <template #footer>
        <p class="text-muted text-center text-sm">
          OpenClaw Mission Control — operator session
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
