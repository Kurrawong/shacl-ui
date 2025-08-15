import { computed, inject, provide, ref, type ComputedRef, type Ref } from 'vue'

import n3 from 'n3'
import { useStore } from '@/composables/store'
import { UISHACLValidator } from '@/core/shapes-graph'
import type { AnyPointer } from 'clownface'

const RESOURCE_MANAGER = Symbol('ResourceManager')

// TODO: constructor specifies the backend store to use (in-memory, remote).

export function provideResourceManager(data?: string, shapes?: string) {
  const parser = new n3.Parser({ blankNodePrefix: '' })
  const shapesStoreManager = useStore(shapes)
  const originalStoreManager = useStore()
  const workingStoreManager = useStore()
  const isEditing = ref(false)
  resetDataGraph(data)

  const validator = computed(() => new UISHACLValidator(shapesStoreManager.store.value))

  const dataGraphPointer = computed(() =>
    validator.value.factory.clownface({ dataset: workingStoreManager.store.value }),
  )

  const shapesGraphPointer = computed(() =>
    validator.value.factory.clownface({ dataset: shapesStoreManager.store.value }),
  )

  const isDirty = computed(() => isEditing.value && hasChanges.value)

  const hasChanges = computed(
    () => !originalStoreManager.store.value.equals(workingStoreManager.store.value),
  )

  function resetDataGraph(data?: string) {
    originalStoreManager.resetStore(data ? parser.parse(data) : [])
    // Store is only equal 
    workingStoreManager.store.value = new n3.Store(Array.from(originalStoreManager.store.value))
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
    addQuad: workingStoreManager.addQuad,
    deleteQuad: workingStoreManager.deleteQuad,
    dataGraph: workingStoreManager.store,
    shapesGraph: shapesStoreManager.store,
    shapesGraphPointer,
    validator,
    dataGraphPointer,
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
    addQuad: workingStoreManager.addQuad,
    deleteQuad: workingStoreManager.deleteQuad,
    dataGraph: workingStoreManager.store,
    shapesGraph: shapesStoreManager.store,
    shapesGraphPointer,
    validator,
    dataGraphPointer,
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
    addQuad: (quad: n3.Quad) => void
    deleteQuad: (quad: n3.Quad) => void
    dataGraph: Ref<n3.Store>
    shapesGraph: Ref<n3.Store>
    shapesGraphPointer: ComputedRef<AnyPointer>
    validator: ComputedRef<UISHACLValidator>
    dataGraphPointer: ComputedRef<AnyPointer>
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
