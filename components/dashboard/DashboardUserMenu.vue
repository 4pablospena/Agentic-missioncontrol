<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { userAvatarSrc } from '~/utils/user-avatar'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const auth = useAuthSession()
const toast = useToast()
const runtimeConfig = useRuntimeConfig()
const apiBase = computed(() => String(runtimeConfig.public.apiBase ?? ''))

const sessionUser = computed(() => auth.user.value)
const sessionData = computed(() => auth.session.value as { loggedInAt?: string } | null)

const display = computed(() => {
  const u = sessionUser.value
  const name = u?.name ?? 'Operator'
  const email = u?.email ?? ''
  return {
    name,
    email,
    role: u?.role ?? 'operator',
    avatar: {
      src: userAvatarSrc(email, u?.avatarUrl, apiBase.value),
      alt: name,
    },
  }
})

const lastLoginLabel = computed(() => {
  const iso = sessionData.value?.loggedInAt
  if (!iso)
    return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  }
  catch {
    return iso
  }
})

async function copyEmail() {
  if (!display.value.email) {
    toast.add({ title: 'No email available', color: 'warning', icon: 'i-lucide-info' })
    return
  }
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

const items = computed<DropdownMenuItem[][]>(() => [
  [{ type: 'label' as const, slot: 'account-header' as const }],
  ...(lastLoginLabel.value
    ? [[{
        type: 'label' as const,
        label: `Last login: ${lastLoginLabel.value}`,
        icon: 'i-lucide-clock',
      }]]
    : []),
  [
    {
      label: 'View account',
      icon: 'i-lucide-user-round',
      to: '/account',
    },
    {
      label: 'Copy email',
      icon: 'i-lucide-copy',
      disabled: !display.value.email,
      onSelect(e: Event) {
        e.preventDefault()
        void copyEmail()
      },
    },
  ],
  [
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'light'
          },
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'dark'
          },
        },
      ],
    },
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect() {
        void signOut()
      },
    },
  ],
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width) min-w-56' }"
  >
    <template #account-header>
      <div class="flex items-start gap-3 py-1">
        <UAvatar :src="display.avatar.src" :alt="display.avatar.alt" size="md" />
        <div class="min-w-0 flex-1">
          <p class="text-highlighted truncate text-sm font-medium">
            {{ display.name }}
          </p>
          <p v-if="display.email" class="text-muted truncate text-xs">
            {{ display.email }}
          </p>
          <UBadge color="primary" variant="subtle" size="xs" class="mt-1.5 capitalize">
            {{ display.role }}
          </UBadge>
        </div>
      </div>
    </template>

    <UButton
      v-bind="{
        avatar: display.avatar,
        label: collapsed ? undefined : display.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      :aria-label="`Account menu for ${display.name}`"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
