<script setup lang="ts">
type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    accentColor?: RetroColor
    icon?: string
  }>(),
  { accentColor: 'indigo' },
)
</script>

<template>
  <header class="rs-page-header">
    <div class="rs-page-header__content">
      <div class="rs-page-header__title-area">
        <div
          v-if="icon"
          class="rs-page-header__icon"
          :class="`rs-page-header__icon--${accentColor}`"
        >
          <UIcon :name="icon" class="size-[18px]" />
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="rs-hero rs-page-header__title">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="rs-body rs-page-header__subtitle"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div class="rs-page-header__actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.rs-page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--rs-bg) 75%, transparent);
  backdrop-filter: blur(var(--rs-blur));
  -webkit-backdrop-filter: blur(var(--rs-blur));
  border-bottom: 1px solid var(--rs-border);
}

.rs-page-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.95rem var(--rs-page-px);
  max-width: var(--rs-content-max);
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 640px) {
  .rs-page-header__content { padding: 1.1rem var(--rs-page-px); gap: 1rem; }
}

.rs-page-header__title-area {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  flex: 1;
}

.rs-page-header__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid;
  border-radius: var(--rs-radius);
  background: rgba(0, 0, 0, 0.25);
}

.rs-page-header__icon--pink   { color: var(--rs-pink-hi);   border-color: color-mix(in srgb, var(--rs-pink)   40%, transparent); background: color-mix(in srgb, var(--rs-pink)   8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-pink)   18%, transparent); }
.rs-page-header__icon--cyan   { color: var(--rs-cyan-hi);   border-color: color-mix(in srgb, var(--rs-cyan)   40%, transparent); background: color-mix(in srgb, var(--rs-cyan)   8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-cyan)   18%, transparent); }
.rs-page-header__icon--purple { color: var(--rs-purple-hi); border-color: color-mix(in srgb, var(--rs-purple) 40%, transparent); background: color-mix(in srgb, var(--rs-purple) 8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-purple) 18%, transparent); }
.rs-page-header__icon--indigo { color: var(--rs-indigo-hi); border-color: color-mix(in srgb, var(--rs-indigo) 40%, transparent); background: color-mix(in srgb, var(--rs-indigo) 8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-indigo) 18%, transparent); }
.rs-page-header__icon--yellow { color: var(--rs-yellow-hi); border-color: color-mix(in srgb, var(--rs-yellow) 40%, transparent); background: color-mix(in srgb, var(--rs-yellow) 8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-yellow) 18%, transparent); }
.rs-page-header__icon--orange { color: var(--rs-orange);    border-color: color-mix(in srgb, var(--rs-orange) 40%, transparent); background: color-mix(in srgb, var(--rs-orange) 8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-orange) 18%, transparent); }
.rs-page-header__icon--green  { color: var(--rs-green-hi);  border-color: color-mix(in srgb, var(--rs-green)  40%, transparent); background: color-mix(in srgb, var(--rs-green)  8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-green)  18%, transparent); }
.rs-page-header__icon--red    { color: var(--rs-red);       border-color: color-mix(in srgb, var(--rs-red)    40%, transparent); background: color-mix(in srgb, var(--rs-red)    8%, rgba(0,0,0,0.25)); box-shadow: 0 0 16px color-mix(in srgb, var(--rs-red)    18%, transparent); }

.rs-page-header__title {
  font-size: var(--rs-text-xl);
  letter-spacing: -0.02em;
  color: var(--rs-text);
}

@media (min-width: 640px) {
  .rs-page-header__title { font-size: var(--rs-text-2xl); }
}

.rs-page-header__subtitle {
  font-size: var(--rs-text-md);
  color: var(--rs-text-muted);
  margin-top: 0.2rem;
  line-height: 1.3;
}

.rs-page-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .rs-page-header__actions { gap: 0.55rem; }
}
</style>
