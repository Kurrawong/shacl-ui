<script setup lang="ts">
import type { BlankNode, DatasetCore, Literal, NamedNode } from '@rdfjs/types'
import type { UISHACLValidator } from '@/core/shapes-graph'

defineProps<{
  focusNode: NamedNode | BlankNode
  path: NamedNode[]
  valueNodes: (NamedNode | BlankNode | Literal)[]
  dataGraph: DatasetCore
  validator: UISHACLValidator
}>()
</script>

<template>
  {{ path }}
</template>
