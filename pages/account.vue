<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const auth = useAuthSession()
const toast = useToast()

const user = computed(() => auth.user.value)
const sessionData = computed(() => auth.session.value as { loggedInAt?: string } | null)

const display = computed(() => {
  const u = user.value
  const email = u?.email ?? ''
  return {
    name: u?.name ?? 'Operator',
    email,
    role: u?.role ?? 'operator',
    avatarSrc: `https://avatar.vercel.sh/${encodeURIComponent(email || 'operator')}`,
  }
})

const lastLoginLabel = computed(() => {
  const iso = sessionData.value?.loggedInAt
  if (!iso)
    return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(new Date(iso))
  }
  catch {
    return iso
  }
})

async function copyEmail() {
  if (!display.value.email)
    return
  try {
    await navigator.clipboard.writeText(display.value.email)
    toast.add({ title: 'Email copied', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({ title: 'Could not copy email', color: 'error', icon: 'i-lucide-x' })
  }
}

async function signOut() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <UDashboardPanel id="account">
    <template #header>
      <UDashboardNavbar title="Account" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <section class="page-toolbar pb-2">
          <p class="text-muted text-sm leading-snug">
            Your operator profile and current session.
          </p>
        </section>

        <CommonEmptyState
          v-if="!user"
          title="No active session."
          description="You appear to be signed out. Log in to see your account."
          icon="i-lucide-user-x"
          :cta="{ label: 'Go to login', to: '/login', icon: 'i-lucide-log-in' }"
        />

        <template v-else>
          <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0', body: 'p-5 sm:p-6' }">
            <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <UAvatar :src="display.avatarSrc" :alt="display.name" size="2xl" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-highlighted truncate text-lg font-semibold">
                    {{ display.name }}
                  </h2>
                  <UBadge color="primary" variant="subtle" size="sm" class="capitalize">
                    {{ display.role }}
                  </UBadge>
                </div>
                <div v-if="display.email" class="flex flex-wrap items-center gap-2">
                  <span class="text-muted font-mono text-sm">{{ display.email }}</span>
                  <UTooltip text="Copy email">
                    <UButton
                      icon="i-lucide-copy"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      square
                      aria-label="Copy email to clipboard"
                      @click="copyEmail"
                    />
                  </UTooltip>
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0', body: 'p-5 sm:p-6' }">
            <template #header>
              <h3 class="text-highlighted font-semibold">
                Session
              </h3>
            </template>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-muted text-xs font-medium uppercase tracking-wide">
                  Last login
                </dt>
                <dd class="text-highlighted mt-1 text-sm">
                  {{ lastLoginLabel ?? '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-medium uppercase tracking-wide">
                  User id
                </dt>
                <dd class="text-highlighted mt-1 font-mono text-sm">
                  {{ user.id }}
                </dd>
              </div>
            </dl>
          </UCard>

          <section class="flex justify-end">
            <UButton
              icon="i-lucide-log-out"
              label="Sign out"
              color="error"
              variant="soft"
              @click="signOut"
            />
          </section>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
