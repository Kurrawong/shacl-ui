<script setup lang="ts">
import { onMounted } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { sh } from '@/lib/namespaces'
import { useInjectPredicateTracker } from '@/composables/predicate-tracking'
import { extractPropertyPath } from 'rdf-validate-shacl/src/property-path'

const { propertyShape, focusNode, dataGraph, validator } = defineProps<{
  propertyShape: Shape
  focusNode: NamedNode | BlankNode
  dataGraph: AnyPointer
  validator: UISHACLValidator
}>()

const { registerHandledPredicate } = useInjectPredicateTracker()

onMounted(() => {
  const path = propertyShape.path
  if (path && path.term.termType === 'NamedNode') {
    console.log('registering', path.term.value)
    registerHandledPredicate(path.term)
  } else if (path && path.term.termType === 'BlankNode') {
    // Check if it's an alternative path.
    // If so, add each predicate path to the tracker.
    const _path = extractPropertyPath(path, validator.ns, true)
    if ('or' in _path) {
      const or = _path.or as NamedNode[]
      for (const alternativePath of or) {
        console.log('registering', alternativePath.value)
        registerHandledPredicate(alternativePath)
      }
    }
  }
})
</script>

<template>
  <div class="text-sm text-gray-500">
    {{ propertyShape.shapeNodePointer.term.value }}
    {{ propertyShape.shapeNodePointer.out(sh.order).term?.value }}
  </div>
</template>
