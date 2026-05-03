<script setup lang="ts">
import type { UpdateOperatorProfilePayload } from '~/models/auth'
import { isUploadedAvatarUrl } from '~/utils/account-avatar-path'
import { userAvatarSrc } from '~/utils/user-avatar'

definePageMeta({ layout: 'dashboard' })

const auth = useAuthSession()
const toast = useToast()
const runtimeConfig = useRuntimeConfig()
const apiBase = computed(() => String(runtimeConfig.public.apiBase ?? ''))

const user = computed(() => auth.user.value)
const sessionData = computed(() => auth.session.value as { loggedInAt?: string } | null)

const draftName = ref('')
const draftAvatarUrl = ref('')
const savingProfile = ref(false)
const uploadingAvatar = ref(false)
const avatarFileInput = ref<HTMLInputElement | null>(null)

watch(
  user,
  (u) => {
    if (u?.name)
      draftName.value = u.name
    draftAvatarUrl.value = isUploadedAvatarUrl(u?.avatarUrl) ? '' : (u?.avatarUrl ?? '')
  },
  { immediate: true },
)

const display = computed(() => {
  const u = user.value
  const email = u?.email ?? ''
  return {
    name: u?.name ?? 'Operator',
    email,
    role: u?.role ?? 'operator',
    avatarSrc: userAvatarSrc(email, u?.avatarUrl, apiBase.value),
  }
})

const hasUploadedAvatar = computed(() => isUploadedAvatarUrl(user.value?.avatarUrl))

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

async function saveProfile() {
  if (!user.value || savingProfile.value)
    return
  savingProfile.value = true
  try {
    const name = draftName.value.trim()
    const ext = draftAvatarUrl.value.trim()
    const payload: UpdateOperatorProfilePayload = { name }
    if (isUploadedAvatarUrl(user.value.avatarUrl)) {
      if (ext)
        payload.avatarUrl = ext
    }
    else {
      payload.avatarUrl = ext
    }
    await auth.updateProfile(payload)
    toast.add({ title: 'Profile saved', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({
      title: 'Could not save profile',
      description: 'Check your connection and try again.',
      color: 'error',
      icon: 'i-lucide-x',
    })
  }
  finally {
    savingProfile.value = false
  }
}

function pickAvatarFile() {
  avatarFileInput.value?.click()
}

async function onAvatarFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !user.value || uploadingAvatar.value)
    return
  uploadingAvatar.value = true
  try {
    await auth.uploadAvatar(file)
    toast.add({ title: 'Photo updated', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({
      title: 'Could not upload photo',
      description: 'Use JPEG, PNG or WebP under 2 MB.',
      color: 'error',
      icon: 'i-lucide-x',
    })
  }
  finally {
    uploadingAvatar.value = false
  }
}

async function clearUploadedAvatar() {
  if (!user.value || uploadingAvatar.value)
    return
  uploadingAvatar.value = true
  try {
    await auth.removeUploadedAvatar()
    toast.add({ title: 'Uploaded photo removed', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({
      title: 'Could not remove photo',
      color: 'error',
      icon: 'i-lucide-x',
    })
  }
  finally {
    uploadingAvatar.value = false
  }
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
                Display name
              </h3>
            </template>
            <p class="text-muted mb-4 text-sm leading-snug">
              Shown in the dashboard and menus. Email and role come from sign-in configuration. To change the operator password, update server environment variables (see <code class="text-xs">.env.example</code>) and redeploy—there is no password editor here.
            </p>
            <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
              <input
                ref="avatarFileInput"
                type="file"
                class="sr-only"
                accept="image/jpeg,image/png,image/webp"
                aria-hidden="true"
                @change="onAvatarFileChange"
              >
              <UFormField label="Name" class="min-w-0 w-full">
                <UInput
                  v-model="draftName"
                  autocomplete="name"
                  maxlength="120"
                  placeholder="Your display name"
                  class="w-full"
                />
              </UFormField>
              <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <UButton
                  type="button"
                  icon="i-lucide-upload"
                  label="Upload photo"
                  variant="soft"
                  :loading="uploadingAvatar"
                  :disabled="uploadingAvatar || savingProfile || !user"
                  @click="pickAvatarFile"
                />
                <UButton
                  v-if="hasUploadedAvatar"
                  type="button"
                  icon="i-lucide-trash-2"
                  label="Remove uploaded photo"
                  color="neutral"
                  variant="ghost"
                  :loading="uploadingAvatar"
                  :disabled="uploadingAvatar || savingProfile"
                  @click="clearUploadedAvatar"
                />
              </div>
              <p class="text-muted text-xs leading-snug">
                JPEG, PNG or WebP · max 2 MB · stored on the server (<code class="text-[0.7rem]">NUXT_AVATAR_UPLOAD_DIR</code> in <code class="text-[0.7rem]">.env.example</code>).
              </p>
              <UFormField
                label="Or avatar image URL"
                description="HTTPS image link instead of an upload. If you use an uploaded photo, this stays blank unless you replace it with a URL."
                class="min-w-0 w-full"
              >
                <UInput
                  v-model="draftAvatarUrl"
                  type="url"
                  autocomplete="photo"
                  maxlength="2048"
                  placeholder="https://…"
                  class="w-full font-mono text-sm"
                />
              </UFormField>
              <div class="flex justify-end">
                <UButton
                  type="submit"
                  label="Save"
                  icon="i-lucide-save"
                  :loading="savingProfile"
                  :disabled="savingProfile || uploadingAvatar || !draftName.trim()"
                />
              </div>
            </form>
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
