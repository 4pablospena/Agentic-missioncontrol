<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'public' })

const auth = useAuthSession()

const loginSchema = z.object({
  email: z.string().trim().email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const pending = ref(false)

async function onSubmit(e: Event) {
  e.preventDefault()
  errorMsg.value = ''
  const result = loginSchema.safeParse({ email: email.value, password: password.value })
  if (!result.success) {
    errorMsg.value = result.error.issues[0]?.message ?? 'Datos no válidos'
    return
  }
  pending.value = true
  try {
    await auth.login({ email: result.data.email, password: result.data.password })
    await navigateTo('/')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string }; statusMessage?: string }
    errorMsg.value = e?.data?.message ?? e?.statusMessage ?? 'No se pudo iniciar sesión'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <RetroCard color="pink" brackets static class="w-full max-w-md p-6 sm:p-8 relative z-10">
    <!-- Logo -->
    <div class="flex flex-col items-center text-center mb-8">
      <div class="rs-login-logo mb-4">
        <UIcon name="i-lucide-zap" class="size-7" />
      </div>
      <p class="rs-hero rs-glow-hero-pink" style="font-size: var(--rs-text-3xl); letter-spacing: 0.08em;">
        OPENCLAW
      </p>
      <p class="rs-display mt-2" style="font-size: var(--rs-text-xs); color: var(--rs-text-muted); letter-spacing: 0.15em;">
        MISSION CONTROL
      </p>
    </div>

    <!-- Form -->
    <form class="flex flex-col gap-5" @submit="onSubmit">
      <div>
        <label class="rs-display text-[0.65rem] tracking-widest mb-2 block" style="color: var(--rs-cyan);">
          OPERADOR
        </label>
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          required
          placeholder="comandante@empresa.com"
          class="rs-input w-full"
        >
      </div>

      <div>
        <label class="rs-display text-[0.65rem] tracking-widest mb-2 block" style="color: var(--rs-cyan);">
          CÓDIGO DE ACCESO
        </label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          placeholder="••••••••"
          class="rs-input w-full"
        >
      </div>

      <RetroCard
        v-if="errorMsg"
        color="red"
        static
        class="px-3 py-2"
      >
        <p class="rs-body text-sm rs-glow-red">⚠ {{ errorMsg }}</p>
      </RetroCard>

      <RetroButton
        type="submit"
        color="pink"
        variant="solid"
        size="lg"
        block
        :loading="pending"
        icon="i-lucide-log-in"
      >
        {{ pending ? 'Conectando' : 'Iniciar Sesión' }}
      </RetroButton>
    </form>

    <p class="rs-body text-center text-sm mt-6" style="color: var(--rs-text-dim);">
      Mission Control v1.0 — Operator Session
    </p>
  </RetroCard>
</template>

<style scoped>
.rs-login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--rs-pink), var(--rs-purple));
  color: var(--rs-bg);
  box-shadow:
    0 0 0 1px var(--rs-pink),
    0 0 24px color-mix(in srgb, var(--rs-pink) 50%, transparent),
    inset 0 0 16px rgba(255, 255, 255, 0.15);
}

.rs-input {
  font-family: var(--rs-font-body);
  font-size: 1.05rem;
  letter-spacing: 0.03em;
  padding: 0.65rem 0.85rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--rs-border);
  color: var(--rs-text);
  transition: border-color 150ms, box-shadow 150ms;
  outline: none;
}

.rs-input::placeholder { color: var(--rs-text-dim); }

.rs-input:focus {
  border-color: var(--rs-cyan);
  box-shadow:
    0 0 0 1px var(--rs-cyan),
    0 0 16px color-mix(in srgb, var(--rs-cyan) 25%, transparent);
}

.rs-input:hover:not(:focus) {
  border-color: color-mix(in srgb, var(--rs-cyan) 40%, var(--rs-border));
}
</style>
