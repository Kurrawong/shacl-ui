<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash, sh } from '@/core/namespaces'
import { useFocusNodeContext } from '@/composables/focus-node'
import { usePredicateTrackerContext } from '@/composables/predicate-tracking'
import { extractPropertyPath } from 'rdf-validate-shacl/src/property-path'
import { useResourceLabelContext } from '@/composables/resource-label'
import { useResourceManagerContext } from '@/composables/resource-manager'
import PredicatePath from '@/components/PredicatePath.vue'
import InversePath from '@/components/InversePath.vue'
// import AlternativePath from '@/components/AlternativePath.vue'

type PathType = 'predicate' | 'inverse' | 'alternative' | null

const props = defineProps<{
  propertyShape: Shape
}>()

const { registerHandledPredicate } = usePredicateTrackerContext()
const { dataGraphPointer, validator } = useResourceManagerContext()
const { focusNode } = useFocusNodeContext()
const { setResourceLabel } = useResourceLabelContext()

onMounted(() => {
  const path = props.propertyShape.path
  if (path && path.term.termType === 'NamedNode') {
    registerHandledPredicate(path.term)
  } else if (path && path.term.termType === 'BlankNode') {
    // Check if it's an alternative path.
    // If so, add each predicate path to the tracker.
    const _path = extractPropertyPath(path, validator.value.ns, true)
    if ('or' in _path) {
      const or = _path.or as NamedNode[]
      for (const alternativePath of or) {
        registerHandledPredicate(alternativePath)
      }
    }
  }
})

onMounted(() => {
  const propertyRole = props.propertyShape.shapeNodePointer.out(dash.propertyRole).term
  if (propertyRole && propertyRole.equals(dash.LabelRole)) {
    const labels = dataGraphPointer.value
      .node(focusNode.value)
      .out(props.propertyShape.path)
      .terms.filter((label) => label.termType === 'Literal') as Literal[]
    if (labels.length) {
      // TODO: get preferred language tag, then no language tag, then first label
      const label = labels[0]
      setResourceLabel(label)
    }
  }
})

const propertyPath = computed(() => {
  const path = props.propertyShape.path
  if (path) {
    return extractPropertyPath(path, validator.value.ns, true)
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
  const shName = props.propertyShape.shapeNodePointer.out(sh`name`).terms
  if (shName.length) {
    // TODO: preference language tag, then no language tag, then first label
    return shName[0].value
  }

  // TODO: labels graph?

  if (propertyPath.value && 'inverse' in propertyPath.value) {
    const path = propertyPath.value.inverse as NamedNode
    return path.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
  }

  // PredicatePath
  const path = propertyPath.value! as NamedNode
  return path.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
})

const valueNodes = computed(() => {
  return props.propertyShape
    .getValueNodes(focusNode.value, dataGraphPointer.value)
    .sort((a, b) => a.value.localeCompare(b.value)) as (NamedNode | BlankNode | Literal)[]
})
</script>

<template>
  <PredicatePath
    v-if="pathType === 'predicate'"
    :path="propertyPath! as NamedNode"
    :path-label="pathLabel"
    :value-nodes="valueNodes"
    :property-shape="propertyShape"
  />

  <!-- <AlternativePath
    v-else-if="pathType === 'alternative'"
    :path="('or' in propertyPath! ? propertyPath.or : []) as NamedNode[]"
    :value-nodes="valueNodes"
  /> -->

  <InversePath
    v-else-if="pathType === 'inverse' && propertyPath && 'inverse' in propertyPath"
    :path="propertyPath.inverse as NamedNode"
    :path-label="pathLabel"
    :value-nodes="valueNodes as (NamedNode | BlankNode)[]"
    :property-shape="propertyShape"
  />

  <template v-else>
    <div v-if="pathType" class="text-sm text-gray-500">{{ pathType }} path not supported.</div>
    <div v-else class="text-sm text-gray-500">{{ propertyPath }} not supported.</div>
  </template>
</template>
