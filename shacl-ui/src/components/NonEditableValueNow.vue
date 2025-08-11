<script setup lang="ts">
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'

defineProps<{
  path: NamedNode
  valueNode: NamedNode | BlankNode | Literal
  propertyShape?: Shape
}>()
</script>

<template>
  <div class="flex items-start gap-2">
    <div class="text-sm">
      {{ valueNode.value }}
    </div>
  </div>
</template>
