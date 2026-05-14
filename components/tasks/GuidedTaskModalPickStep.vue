<script setup lang="ts">
import type { GuidedTaskAgentGroup } from '~/composables/useGuidedTaskModal'
import type { TaskTemplate } from '~/config/task-templates'

defineProps<{
  agentGroups: GuidedTaskAgentGroup[]
  restrictedButEmpty: boolean
}>()

const emit = defineEmits<{
  select: [template: TaskTemplate, agentId: string]
  'clear-restrict': []
}>()
</script>

<template>
  <div>
    <RetroEmptyState
      v-if="agentGroups.length === 0 && !restrictedButEmpty"
      title="Sin agentes"
      description="No hay agentes disponibles. Comprueba la conexión con Openclaw."
      color="purple"
    />

    <div
      v-else-if="restrictedButEmpty"
      class="flex flex-col gap-4 items-stretch"
    >
      <RetroEmptyState
        title="Sin plantillas para este agente"
        description="No hay tareas guiadas definidas para este nombre de agente, o el agente no está en la lista. Puedes ver todas las plantillas del escuadrón o crear una orden desde Misiones."
        color="purple"
      />
      <RetroButton
        color="pink"
        variant="outline"
        size="md"
        block
        icon="i-lucide-users"
        @click="emit('clear-restrict')"
      >
        Ver plantillas de todos los agentes
      </RetroButton>
    </div>

    <div v-for="group in agentGroups" :key="group.agentName" class="mb-6 last:mb-0">
      <p
        class="rs-display text-[0.6rem] mb-3 tracking-widest"
        :style="{ color: group.neonColor, textShadow: `0 0 6px ${group.neonColor}` }"
      >
        ◢ {{ group.displayName }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <RetroCard
          v-for="template in group.templates"
          :key="template.id"
          color="pink"
          interactive
          class="p-3.5 flex items-start gap-3 text-left"
          @click="emit('select', template, group.agentId)"
        >
          <UIcon
            :name="template.icon"
            class="size-5 shrink-0 mt-0.5"
            :style="{ color: group.neonColor, filter: `drop-shadow(0 0 4px ${group.neonColor})` }"
          />
          <div class="min-w-0 flex-1">
            <p class="rs-display text-[0.7rem] leading-tight" style="color: var(--rs-text);">
              {{ template.name }}
            </p>
            <p class="rs-body text-sm mt-1" style="color: var(--rs-text-muted);">
              {{ template.description }}
            </p>
          </div>
        </RetroCard>
      </div>
    </div>
  </div>
</template>
