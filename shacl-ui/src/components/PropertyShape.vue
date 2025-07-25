<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash, sh } from '@/lib/namespaces'
import { useInjectPredicateTracker } from '@/composables/predicate-tracking'
import { extractPropertyPath } from 'rdf-validate-shacl/src/property-path'
import PredicatePathLabel from '@/components/PredicatePathLabel.vue'
import { useInjectFormLabel } from '@/composables/form-label'
import PropertyPathBase from '@/components/PropertyPathBase.vue'

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

const path = computed(() => {
  return propertyShape.path?.term as NamedNode
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
  return dataGraph.node(focusNode).out(propertyShape.path).terms
})
</script>

<template>
  <PropertyPathBase>
    <template #path-type>
      {{ pathType }}
    </template>
    <template #path-label>
      <PredicatePathLabel :label="pathLabel" :predicate-path="path" />
    </template>
    <template #value-nodes>
      <div v-if="valueNodes.length === 0" class="text-sm text-gray-400 italic">No values</div>
      <div v-else class="space-y-2">
        <div v-for="valueNode in valueNodes" :key="valueNode.value" class="flex items-center gap-2">
          <input
            type="text"
            :value="valueNode.value"
            class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readonly
          />
        </div>
      </div>
    </template>
  </PropertyPathBase>
</template>
