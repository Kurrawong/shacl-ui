<script setup lang="ts">
import type { NamedNode, BlankNode } from '@rdfjs/types'
import Button from '@/components/ui/button/Button.vue'
import { provideResourceManager } from '@/composables/resource-manager'
import { provideResourceLabel } from '@/composables/resource-label'
import FocusNodeLabel from '@/components/FocusNodeLabel.vue'
import { provideFocusNode } from '@/composables/focus-node'
import SHACLValidation from '@/components/SHACLValidation.vue'

const props = withDefaults(
  defineProps<{
    focusNode: NamedNode | BlankNode
    dataGraph: string
    shapesGraph: string
    nodeShape: NamedNode | BlankNode | null
    isRootNode?: boolean
  }>(),
  {
    isRootNode: false,
  },
)

const { isEditing, isDirty, save, cancelEditing, startEditing } = provideResourceManager(
  props.dataGraph,
  props.shapesGraph,
)
const { getResourceLabel } = provideResourceLabel(props.focusNode)
provideFocusNode(props.focusNode)
</script>

<template>
  <div
    class="border-b border-gray-200 flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16"
  >
    <div class="min-w-fit">
      <FocusNodeLabel :label="getResourceLabel()" />
      <div class="text-xs text-gray-500 font-mono">IRI: {{ focusNode.value }}</div>
    </div>
    <div class="ml-auto flex w-full space-x-2 sm:justify-end">
      <Button v-if="isEditing" variant="default" @click="save" :disabled="!isDirty">Save</Button>
      <Button v-else variant="default" @click="startEditing">Edit</Button>
      <Button v-if="isEditing" variant="secondary" @click="cancelEditing">Cancel</Button>
    </div>
  </div>

  <div class="py-4">
    <SHACLValidation :nodeShape="nodeShape" />
  </div>
</template>
