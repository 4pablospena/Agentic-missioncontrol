import { getFilesForAgent, TIER_META, type AgentFile } from '~/config/agent-files-mock'
import type { AgentSummary } from '~/models/agent'
import type { AgentProfile } from '~/config/agent-profiles'

export type AgentFilesDrawerCardColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red'

export function agentFileTierColor(tier: string): AgentFilesDrawerCardColor {
  const map: Record<string, AgentFilesDrawerCardColor> = {
    T0: 'pink',
    T1: 'cyan',
    T2: 'purple',
    T3: 'yellow',
    T4: 'orange',
  }
  return map[tier] ?? 'cyan'
}

export function agentFileLineCount(content: string): number {
  return content.split('\n').length
}

export function useAgentFilesDrawerState(
  props: ToRefs<{
    open: boolean
    agent: AgentSummary | null
    profile: AgentProfile | null
  }>,
  setOpen: (value: boolean) => void,
) {
  const toast = useToast()

  const cardColor = computed<AgentFilesDrawerCardColor>(() => {
    if (!props.profile.value)
      return 'pink'
    const map: Record<string, AgentFilesDrawerCardColor> = {
      success: 'green',
      info: 'cyan',
      secondary: 'purple',
      warning: 'yellow',
      error: 'orange',
    }
    return map[props.profile.value.twColor] ?? 'pink'
  })

  const allFiles = ref<AgentFile[]>([])
  const selectedPath = ref<string>('SOUL.md')
  const draftContents = ref<Record<string, string>>({})
  const dirtyPaths = ref<Set<string>>(new Set())
  const showSensitive = ref(false)

  watch(
    [() => props.open.value, () => props.agent.value?.id],
    ([isOpen, agentId]) => {
      if (!isOpen || !agentId)
        return
      allFiles.value = getFilesForAgent(agentId)
      draftContents.value = Object.fromEntries(
        allFiles.value.map(f => [f.path, f.content]),
      )
      dirtyPaths.value = new Set()
      if (allFiles.value.length > 0) {
        selectedPath.value = allFiles.value[0]!.path
      }
      showSensitive.value = false
    },
    { immediate: true },
  )

  const selectedFile = computed(
    () => allFiles.value.find(f => f.path === selectedPath.value) ?? null,
  )

  const filesByTier = computed(() => {
    const groups: Record<string, AgentFile[]> = {}
    for (const f of allFiles.value) {
      ;(groups[f.tier] ??= []).push(f)
    }
    return groups
  })

  const tiers = computed(() =>
    TIER_META.filter(t => filesByTier.value[t.id]?.length),
  )

  const currentDraft = computed({
    get: () => draftContents.value[selectedPath.value] ?? '',
    set: (val: string) => {
      draftContents.value[selectedPath.value] = val
      const sel = selectedFile.value
      if (sel && val !== sel.content) {
        dirtyPaths.value.add(selectedPath.value)
      }
      else {
        dirtyPaths.value.delete(selectedPath.value)
      }
    },
  })

  const isCurrentDirty = computed(() => dirtyPaths.value.has(selectedPath.value))
  const totalDirty = computed(() => dirtyPaths.value.size)

  function selectFile(path: string) {
    selectedPath.value = path
  }

  function discardChanges() {
    const sel = selectedFile.value
    if (!sel)
      return
    draftContents.value[selectedPath.value] = sel.content
    dirtyPaths.value.delete(selectedPath.value)
  }

  function saveCurrent() {
    const sel = selectedFile.value
    if (!sel || !isCurrentDirty.value)
      return
    sel.content = draftContents.value[selectedPath.value] ?? ''
    dirtyPaths.value.delete(selectedPath.value)
    toast.add({
      title: 'Guardado',
      description: `${sel.path} actualizado`,
      color: 'success',
    })
  }

  function close() {
    if (totalDirty.value > 0) {
      if (!confirm(`Tienes ${totalDirty.value} cambio(s) sin guardar. ¿Cerrar de todos modos?`))
        return
    }
    setOpen(false)
  }

  const modelOpen = computed({
    get: () => props.open.value,
    set: (v: boolean) => {
      if (!v)
        close()
      else
        setOpen(true)
    },
  })

  return {
    cardColor,
    allFiles,
    selectedPath,
    draftContents,
    dirtyPaths,
    showSensitive,
    selectedFile,
    filesByTier,
    tiers,
    currentDraft,
    isCurrentDirty,
    totalDirty,
    selectFile,
    discardChanges,
    saveCurrent,
    close,
    modelOpen,
  }
}
