import { isUploadedAvatarUrl } from '~/utils/account-avatar-path'
import { userAvatarSrc } from '~/utils/user-avatar'

export function useAccountPage() {
  const auth = useAuthSession()
  const toast = useToast()
  const runtimeConfig = useRuntimeConfig()
  const apiBase = computed(() => String(runtimeConfig.public.apiBase ?? ''))

  const user = computed(() => auth.user.value)
  const sessionData = computed(() => auth.session.value as { loggedInAt?: string } | null)

  const draftName = ref('')
  const savingProfile = ref(false)
  const uploadingAvatar = ref(false)
  const avatarFileInput = ref<HTMLInputElement | null>(null)

  watch(
    user,
    (u) => {
      if (u?.name)
        draftName.value = u.name
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

  const now = ref(Date.now())
  let nowTimer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    nowTimer = setInterval(() => {
      now.value = Date.now()
    }, 60_000)
  })
  onBeforeUnmount(() => {
    if (nowTimer) {
      clearInterval(nowTimer)
      nowTimer = null
    }
  })

  const relativeLastLogin = computed(() => {
    const iso = sessionData.value?.loggedInAt
    if (!iso)
      return null
    try {
      const target = new Date(iso).getTime()
      if (Number.isNaN(target))
        return null
      const diffSec = Math.round((target - now.value) / 1000)
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
      const abs = Math.abs(diffSec)
      if (abs < 60)
        return rtf.format(diffSec, 'second')
      const diffMin = Math.round(diffSec / 60)
      if (Math.abs(diffMin) < 60)
        return rtf.format(diffMin, 'minute')
      const diffHr = Math.round(diffMin / 60)
      if (Math.abs(diffHr) < 24)
        return rtf.format(diffHr, 'hour')
      const diffDay = Math.round(diffHr / 24)
      if (Math.abs(diffDay) < 30)
        return rtf.format(diffDay, 'day')
      const diffMonth = Math.round(diffDay / 30)
      if (Math.abs(diffMonth) < 12)
        return rtf.format(diffMonth, 'month')
      return rtf.format(Math.round(diffMonth / 12), 'year')
    }
    catch {
      return null
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

  async function saveProfile() {
    if (!user.value || savingProfile.value)
      return
    savingProfile.value = true
    try {
      await auth.updateProfile({ name: draftName.value.trim() })
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
    if (uploadingAvatar.value)
      return
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

  return {
    user,
    draftName,
    savingProfile,
    uploadingAvatar,
    avatarFileInput,
    display,
    hasUploadedAvatar,
    lastLoginLabel,
    relativeLastLogin,
    copyEmail,
    saveProfile,
    pickAvatarFile,
    onAvatarFileChange,
    clearUploadedAvatar,
  }
}
