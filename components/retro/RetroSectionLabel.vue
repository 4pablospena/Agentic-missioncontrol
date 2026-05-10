<script setup lang="ts">
type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

withDefaults(
  defineProps<{
    label: string
    count?: number
    color?: RetroColor
  }>(),
  { color: 'neutral' },
)
</script>

<template>
  <div class="rs-section">
    <p
      class="rs-display rs-section__text"
      :class="{
        'rs-section__text--pink':   color === 'pink',
        'rs-section__text--cyan':   color === 'cyan',
        'rs-section__text--purple': color === 'purple',
        'rs-section__text--indigo': color === 'indigo',
        'rs-section__text--yellow': color === 'yellow',
        'rs-section__text--orange': color === 'orange',
        'rs-section__text--green':  color === 'green',
        'rs-section__text--red':    color === 'red',
      }"
    >
      {{ label }}
      <span v-if="count !== undefined" class="rs-section__count">{{ count }}</span>
    </p>
  </div>
</template>

<style scoped>
.rs-section {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.rs-section__text {
  font-size: var(--rs-text-md);
  color: var(--rs-text);
  letter-spacing: -0.005em;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.rs-section__count {
  font-family: var(--rs-font-mono);
  font-size: var(--rs-text-xs);
  font-weight: 500;
  color: var(--rs-text-dim);
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  letter-spacing: 0;
}

.rs-section__text--pink   { color: var(--rs-pink-hi); }
.rs-section__text--cyan   { color: var(--rs-cyan-hi); }
.rs-section__text--purple { color: var(--rs-purple-hi); }
.rs-section__text--indigo { color: var(--rs-indigo-hi); }
.rs-section__text--yellow { color: var(--rs-yellow-hi); }
.rs-section__text--orange { color: var(--rs-orange); }
.rs-section__text--green  { color: var(--rs-green-hi); }
.rs-section__text--red    { color: var(--rs-red); }
</style>
