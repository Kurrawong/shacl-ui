<script setup lang="ts">
import type { NamedNode, BlankNode } from '@rdfjs/types'
import { toRef, computed } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import { useResourceManagerContext } from '@/composables/resource-manager'
import { provideResourceLabel } from '@/composables/resource-label'
import FocusNodeLabel from '@/components/FocusNodeLabel.vue'
import { provideFocusNode } from '@/composables/focus-node'
import FocusNode from '@/components/FocusNode.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { rdf } from '@/core/namespaces'

const props = defineProps<{
  focusNode: NamedNode | BlankNode
  nodeShape: NamedNode | BlankNode | null
}>()

const { isEditing, isDirty, save, cancelEditing, startEditing, dataGraphPointer } =
  useResourceManagerContext()
const focusNode = toRef(props, 'focusNode')
const { getResourceLabel } = provideResourceLabel(focusNode)
provideFocusNode(focusNode)

const classTypes = computed(() => {
  return Array.from(dataGraphPointer.value.dataset.match(focusNode.value, rdf.type, null)).map(
    (quad) => quad.object as NamedNode,
  )
})
</script>

<template>
  <div class="border-b border-gray-200 py-4">
    <div
      class="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0 md:h-16"
    >
      <div class="min-w-fit">
        <FocusNodeLabel :label="getResourceLabel()" />
        <div class="text-xs text-gray-500 font-mono">IRI: {{ focusNode.value }}</div>
      </div>
      <div class="ml-auto flex w-full space-x-2 sm:justify-end">
        <Button v-if="isEditing" variant="default" @click="save" :disabled="!isDirty">Apply changes</Button>
        <Button v-else variant="default" @click="startEditing">Edit</Button>
        <Button v-if="isEditing" variant="secondary" @click="cancelEditing">Cancel</Button>
      </div>
    </div>

    <div class="space-x-1">
      <TooltipProvider>
        <Tooltip v-for="classType in classTypes" :key="classType.value">
          <TooltipTrigger as-child>
            <Badge variant="outline">{{
              classType.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
            }}</Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{{ classType.value }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>

  <div class="py-4">
    <FocusNode :focus-node="focusNode" :node-shape="nodeShape" />
  </div>
</template>
