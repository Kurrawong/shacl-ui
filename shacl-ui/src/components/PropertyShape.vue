<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash } from '@/lib/namespaces'
import { useInjectPredicateTracker } from '@/composables/predicate-tracking'
import { extractPropertyPath } from 'rdf-validate-shacl/src/property-path'
import { useInjectFormLabel } from '@/composables/form-label'
import PredicatePath from '@/components/PredicatePath.vue'

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
    registerHandledPredicate(path.term)
  } else if (path && path.term.termType === 'BlankNode') {
    // Check if it's an alternative path.
    // If so, add each predicate path to the tracker.
    const _path = extractPropertyPath(path, validator.ns, true)
    if ('or' in _path) {
      const or = _path.or as NamedNode[]
      for (const alternativePath of or) {
        registerHandledPredicate(alternativePath)
      }
    }
  }
})

onMounted(() => {
  const propertyRole = propertyShape.shapeNodePointer.out(dash.propertyRole).term
  if (propertyRole && propertyRole.equals(dash.LabelRole)) {
    const labels = dataGraph
      .node(focusNode)
      .out(propertyShape.path)
      .terms.filter((label) => label.termType === 'Literal') as Literal[]
    if (labels.length) {
      // TODO: get preferred language tag, then no language tag, then first label
      const label = labels[0]
      const { setFormLabel } = useInjectFormLabel()
      setFormLabel(label)
    }
  }
})

type PathType = 'predicate' | 'inverse' | 'alternative' | 'other'

const pathType = computed<PathType>(() => {
  const path = propertyShape.path
  if (path && path.term.termType === 'NamedNode') {
    return 'predicate'
  }

  if (path && path.term.termType === 'BlankNode') {
    const _path = extractPropertyPath(path, validator.ns, true)
    if ('or' in _path) {
      return 'alternative'
    } else if ('inverse' in _path) {
      return 'inverse'
    }
  }

  return 'other'
})
</script>

<template>
  <PredicatePath
    v-if="pathType === 'predicate'"
    :property-shape="propertyShape"
    :focus-node="focusNode"
    :data-graph="dataGraph"
    :validator="validator"
  />

  <template v-else>
    <div class="text-sm text-gray-500">{{ pathType }} path not supported yet.</div>
  </template>
</template>
