<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const {
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
} = useAccountPage()
</script>

<template>
  <UDashboardPanel id="account">
    <template #header>
      <UDashboardNavbar title="Account">
        <template #leading>
          <DashboardMobileNavToggle />
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

        <ClientOnly>
          <DashboardAccountSignOutHint />
        </ClientOnly>

        <CommonEmptyState
          v-if="!user"
          title="No active session."
          description="You appear to be signed out. Log in to see your account."
          icon="i-lucide-user-x"
          :cta="{ label: 'Go to login', to: '/login', icon: 'i-lucide-log-in' }"
        />

        <template v-else>
          <input
            ref="avatarFileInput"
            type="file"
            class="sr-only"
            accept="image/jpeg,image/png,image/webp"
            aria-hidden="true"
            tabindex="-1"
            @change="onAvatarFileChange"
          >

          <UCard
            class="panel-shell account-card account-card-hero rounded-2xl transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl lg:hover:shadow-2xl dark:hover:shadow-black/50"
            :ui="{ root: 'ring-primary/35 dark:ring-primary/45 ring-2', body: 'p-5 sm:p-7' }"
          >
            <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div class="group relative shrink-0">
                <button
                  type="button"
                  class="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default disabled:cursor-not-allowed"
                  :disabled="uploadingAvatar"
                  aria-label="Change profile photo"
                  @click="pickAvatarFile"
                >
                  <UAvatar
                    :src="display.avatarSrc"
                    :alt="display.name"
                    size="3xl"
                    class="ring-default ring-2"
                  />
                  <span
                    class="bg-default/70 pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    :class="{ 'opacity-100!': uploadingAvatar }"
                  >
                    <UIcon
                      :name="uploadingAvatar ? 'i-lucide-loader-2' : 'i-lucide-camera'"
                      :class="['text-highlighted size-5', { 'animate-spin': uploadingAvatar }]"
                    />
                    <span class="text-highlighted text-[0.7rem] font-medium leading-tight">
                      {{ uploadingAvatar ? 'Uploading…' : 'Change photo' }}
                    </span>
                  </span>
                </button>

                <UTooltip v-if="hasUploadedAvatar" text="Remove uploaded photo">
                  <UButton
                    type="button"
                    icon="i-lucide-trash-2"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    square
                    class="absolute -bottom-1 -right-1 opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    :loading="uploadingAvatar"
                    :disabled="uploadingAvatar || savingProfile"
                    aria-label="Remove uploaded photo"
                    @click.stop="clearUploadedAvatar"
                  />
                </UTooltip>
              </div>

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

                <div v-if="relativeLastLogin" class="pt-1">
                  <UTooltip :text="lastLoginLabel ?? ''">
                    <UBadge color="neutral" variant="subtle" size="sm" class="gap-1">
                      <UIcon name="i-lucide-clock" class="size-3.5" />
                      Last login {{ relativeLastLogin }}
                    </UBadge>
                  </UTooltip>
                </div>
              </div>
            </div>
          </UCard>

          <div class="grid gap-6 lg:grid-cols-3">
            <UCard
              class="panel-shell account-card rounded-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg lg:col-span-2 dark:hover:shadow-black/45"
              :ui="{ root: 'ring-default/55 dark:ring-white/12 ring-1', body: 'p-5 sm:p-6' }"
            >
              <template #header>
                <h3 class="text-highlighted font-semibold">
                  Profile
                </h3>
              </template>
              <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
                <UFormField label="Name" class="min-w-0 w-full">
                  <UInput
                    v-model="draftName"
                    autocomplete="name"
                    maxlength="120"
                    placeholder="Your display name"
                    class="w-full"
                  />
                </UFormField>
                <p class="text-muted text-xs leading-snug">
                  Profile photo: hover the avatar above to change or remove it. JPEG, PNG or WebP up to 2 MB.
                </p>
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

            <UCard
              class="panel-shell account-card rounded-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg lg:col-span-1 dark:hover:shadow-black/45"
              :ui="{ root: 'ring-default/55 dark:ring-white/12 ring-1', body: 'p-5 sm:p-6' }"
            >
              <template #header>
                <h3 class="text-highlighted font-semibold">
                  Session
                </h3>
              </template>
              <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.account-card:not(.account-card-hero) {
  background-image: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.05) 0%,
    transparent 38%
  );
}

.dark .account-card:not(.account-card-hero) {
  background-image: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.055) 0%,
    transparent 36%
  );
}

.account-card-hero {
  background-image:
    radial-gradient(
      ellipse 85% 65% at 92% -8%,
      color-mix(in oklab, var(--ui-primary) 22%, transparent),
      transparent 52%
    ),
    radial-gradient(
      ellipse 70% 50% at 4% 105%,
      color-mix(in oklab, var(--ui-primary) 14%, transparent),
      transparent 48%
    );
}

.dark .account-card-hero {
  background-image:
    radial-gradient(
      ellipse 85% 65% at 92% -8%,
      color-mix(in oklab, var(--ui-primary) 18%, transparent),
      transparent 52%
    ),
    radial-gradient(
      ellipse 70% 50% at 4% 105%,
      color-mix(in oklab, var(--ui-primary) 11%, transparent),
      transparent 48%
    );
}
</style>
