<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash, sh } from '@/lib/namespaces'
import { useInjectPredicateTracker } from '@/composables/predicate-tracking'
import { extractPropertyPath } from 'rdf-validate-shacl/src/property-path'
import { useInjectFormLabel } from '@/composables/form-label'
import PredicatePath, { type PathType } from '@/components/PredicatePath.vue'

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

const propertyPath = computed(() => {
  const path = propertyShape.path
  if (path) {
    return extractPropertyPath(path, validator.ns, true)
  }

  return null
})

const pathType = computed<PathType>(() => {
  if (
    propertyPath.value &&
    'termType' in propertyPath.value &&
    propertyPath.value.termType === 'NamedNode'
  ) {
    return 'predicate'
  }

  if (propertyPath.value && 'or' in propertyPath.value) {
    return 'alternative'
  }

  if (propertyPath.value && 'inverse' in propertyPath.value) {
    return 'inverse'
  }

  return null
})

const pathLabel = computed(() => {
  const shName = propertyShape.shapeNodePointer.out(sh`name`).terms
  if (shName.length) {
    // TODO: preference language tag, then no language tag, then first label
    return shName[0].value
  }

  // TODO: labels graph?

  return propertyShape.shapeNodePointer.term.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
})

const valueNodes = computed(() => {
  return propertyShape.getValueNodes(focusNode, dataGraph) as (NamedNode | BlankNode | Literal)[]
})
</script>

<template>
  <PredicatePath
    v-if="pathType === 'predicate'"
    :focus-node="focusNode"
    :path="propertyPath! as NamedNode"
    :path-type="pathType"
    :path-label="pathLabel"
    :value-nodes="valueNodes"
    :data-graph="dataGraph"
    :validator="validator"
    :property-shape="propertyShape"
  />

  <template v-else>
    <div class="text-sm text-gray-500">{{ pathType }} path not supported yet.</div>
  </template>
</template>
