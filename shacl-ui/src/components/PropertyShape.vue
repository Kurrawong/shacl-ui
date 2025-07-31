<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { NamedNode, BlankNode, Literal, DatasetCore } from '@rdfjs/types'
import type { UISHACLValidator } from '@/core/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash, sh } from '@/core/namespaces'
import { useInjectPredicateTracker } from '@/composables/predicate-tracking'
import { extractPropertyPath } from 'rdf-validate-shacl/src/property-path'
import { useInjectFormLabel } from '@/composables/form-label'
import PredicatePath, { type PathType } from '@/components/PredicatePath.vue'
// import InversePath from '@/components/InversePath.vue'
// import AlternativePath from '@/components/AlternativePath.vue'

const props = defineProps<{
  propertyShape: Shape
  focusNode: NamedNode | BlankNode
  dataGraph: DatasetCore
  validator: UISHACLValidator
}>()

const { registerHandledPredicate } = useInjectPredicateTracker()
const dataGraphPointer = computed(() =>
  props.validator.factory.clownface({ dataset: props.dataGraph }),
)

onMounted(() => {
  const path = props.propertyShape.path
  if (path && path.term.termType === 'NamedNode') {
    registerHandledPredicate(path.term)
  } else if (path && path.term.termType === 'BlankNode') {
    // Check if it's an alternative path.
    // If so, add each predicate path to the tracker.
    const _path = extractPropertyPath(path, props.validator.ns, true)
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
      .node(props.focusNode)
      .out(props.propertyShape.path)
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
  const path = props.propertyShape.path
  if (path) {
    return extractPropertyPath(path, props.validator.ns, true)
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
    .getValueNodes(props.focusNode, dataGraphPointer.value)
    .sort((a, b) => a.value.localeCompare(b.value)) as (NamedNode | BlankNode | Literal)[]
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

  <!-- <AlternativePath
    v-else-if="pathType === 'alternative'"
    :focus-node="focusNode"
    :path="('or' in propertyPath! ? propertyPath.or : []) as NamedNode[]"
    :value-nodes="valueNodes"
    :data-graph="dataGraph"
    :validator="validator"
  /> -->

  <!-- <InversePath
    v-else-if="pathType === 'inverse'"
    :focus-node="focusNode"
    :path="propertyPath!.inverse as NamedNode"
    :path-type="pathType"
    :path-label="pathLabel"
    :value-nodes="valueNodes"
    :data-graph="dataGraph"
    :validator="validator"
    :property-shape="propertyShape"
  /> -->

  <template v-else>
    <div v-if="pathType" class="text-sm text-gray-500">{{ pathType }} path not supported.</div>
    <div v-else class="text-sm text-gray-500">{{ propertyPath }} not supported.</div>
  </template>
</template>
