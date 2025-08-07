import { computed, inject, provide, ref, type ComputedRef, type Ref } from 'vue'

import n3 from 'n3'
import { useStore } from '@/composables/store'

const RESOURCE_MANAGER = Symbol('ResourceManager')

// TODO: constructor specifies the backend store to use (in-memory, remote).

export function provideResourceManager(data?: string, shapes?: string) {
  const parser = new n3.Parser()
  const shapesStoreManager = useStore(shapes)
  const originalStoreManager = useStore()
  const workingStoreManager = useStore()
  const isEditing = ref(false)
  const isDirty = computed(() => isEditing.value && hasChanges.value)
  resetDataGraph(data)

  function resetDataGraph(data?: string) {
    originalStoreManager.resetStore(data ? parser.parse(data) : [])
    workingStoreManager.addQuads(Array.from(originalStoreManager.store.value))
  }

  function resetShapesGraph(shapes?: string) {
    shapesStoreManager.resetStore(shapes ? parser.parse(shapes) : [])
  }

  function startEditing() {
    isEditing.value = true
  }

  function cancelEditing() {
    const originalQuads = Array.from(originalStoreManager.store.value)
    workingStoreManager.resetStore(originalQuads)
    isEditing.value = false
  }

  const hasChanges = computed(
    () => !originalStoreManager.store.value.equals(workingStoreManager.store.value),
  )

  function save() {
    if (!isEditing.value || !hasChanges.value) {
      return
    }

    const quads = Array.from(workingStoreManager.store.value)
    originalStoreManager.resetStore(quads)
    isEditing.value = false
    workingStoreManager.resetStore(quads)

    // TODO: save to server
  }

  provide(RESOURCE_MANAGER, {
    dataGraph: workingStoreManager.store,
    shapesGraph: shapesStoreManager.store,
    isEditing,
    isDirty,
    resetDataGraph,
    resetShapesGraph,
    startEditing,
    cancelEditing,
    hasChanges,
    save,
  })

  return {
    dataGraph: workingStoreManager.store,
    shapesGraph: shapesStoreManager.store,
    isEditing,
    isDirty,
    resetDataGraph,
    resetShapesGraph,
    startEditing,
    cancelEditing,
    hasChanges,
    save,
  }
}

export function useResourceManagerContext() {
  const resourceManager = inject<{
    dataGraph: Ref<n3.Store>
    shapesGraph: Ref<n3.Store>
    isEditing: Ref<boolean>
    isDirty: ComputedRef<boolean>
    resetDataGraph: (data?: string) => void
    resetShapesGraph: (shapes?: string) => void
    startEditing: () => void
    cancelEditing: () => void
    hasChanges: ComputedRef<boolean>
    save: () => void
  }>(RESOURCE_MANAGER)
  if (!resourceManager) {
    throw new Error('ResourceManager not found')
  }
  return resourceManager
}
