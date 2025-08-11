<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { getViewerWidgets } from '@/core/widgets'

const props = defineProps<{
  path: NamedNode
  valueNode: NamedNode | BlankNode | Literal
  propertyShape?: Shape
}>()

const viewerWidgets = computed(() => {
  return getViewerWidgets(props.valueNode, props.propertyShape).filter(
    (widget) => widget.score === null || widget.score > 0,
  )
})

const selectedViewerWidget = ref(viewerWidgets.value.at(0) ?? null)
</script>

<template>
  <div class="flex items-start gap-2">
    <div class="text-sm">
      {{ valueNode.value }}

      ({{ selectedViewerWidget?.term.value.split('#').at(-1)?.split('/').at(-1) }})
    </div>
  </div>
</template>
