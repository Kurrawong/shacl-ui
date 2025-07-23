<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import n3 from 'n3'

import { useStore } from '@/composables/store'
import { rdfs, sh } from '@/lib/namespaces'
import { getPropertyShapes } from '@/lib/shacl'
import type { UITree } from '@/types'
import FocusNode from '@/components/FocusNode.vue'
import { normalizePropertyPath } from '@/lib/shacl'

const props = withDefaults(
  defineProps<{
    focusNode: NamedNode | BlankNode
    dataGraph: string
    shapesGraph: string
    nodeShape: NamedNode | BlankNode | null
    isRootNode?: boolean
  }>(),
  {
    isRootNode: false,
  },
)

const { store: dataGraph, addQuad } = useStore(props.dataGraph)
const { store: shapesGraph } = useStore(props.shapesGraph)

const uiTree = ref<UITree>({
  focusNode: props.focusNode,
  nodeShape: props.nodeShape,
  propertyGroups: [],
  propertyPaths: {},
})
onMounted(() => {
  buildUITree()
})
watch(shapesGraph, () => {
  buildUITree()
})

function getPropertyGroups(
  propertyShapes: (NamedNode | BlankNode)[],
  shapesGraph: n3.Store,
): (NamedNode | BlankNode)[] {
  const propertyGroupsSeen = new Set<string>()
  const propertyGroups: (NamedNode | BlankNode)[] = []
  for (const propertyShape of propertyShapes) {
    const propertyGroupValues = shapesGraph.getObjects(propertyShape, sh.group, null)
    for (const propertyGroupValue of propertyGroupValues) {
      if (!propertyGroupsSeen.has(propertyGroupValue.value)) {
        propertyGroupsSeen.add(propertyGroupValue.value)
        propertyGroups.push(propertyGroupValue as NamedNode | BlankNode)
      }
    }
  }
  return propertyGroups
}

function sortWithNulls(a: number | null, b: number | null) {
  if (a === null) {
    return 1
  }
  if (b === null) {
    return -1
  }
  return (a || 0) - (b || 0)
}

function buildUITree() {
  if (uiTree.value.nodeShape) {
    const propertyShapes = getPropertyShapes(uiTree.value.nodeShape, shapesGraph.value)
    const propertyGroups = getPropertyGroups(propertyShapes, shapesGraph.value)

    // Assign the property groups to the UI tree.
    uiTree.value.propertyGroups = propertyGroups.map((propertyGroup) => {
      const orderValues = shapesGraph.value
        .getObjects(propertyGroup, sh.order, null)
        .filter((orderValue) => orderValue.termType === 'Literal')
      if (orderValues.length > 1) {
        throw new Error('A property group must contain only one sh:order property.')
      }
      const order = orderValues.length ? Number(orderValues[0].value) : null
      const labels = shapesGraph.value
        .getObjects(propertyGroup, rdfs.label, null)
        .filter((label) => label.termType === 'Literal')
      return {
        term: propertyGroup,
        order,
        labels,
        propertyPaths: [],
      }
    })

    // Sort the property groups by order.
    uiTree.value.propertyGroups.sort((a, b) => sortWithNulls(a.order, b.order))

    // Assign the predicates to the UI tree.
    for (const propertyShape of propertyShapes) {
      const propertyPathValues = shapesGraph.value
        .getObjects(propertyShape, sh.path, null)
        .filter(
          (propertyPath) =>
            propertyPath.termType === 'NamedNode' || propertyPath.termType === 'BlankNode',
        )

      if (propertyPathValues.length === 0) {
        throw new Error('A property shape must contain a sh:path property.')
      }

      if (propertyPathValues.length > 1) {
        throw new Error('A property shape must contain only one sh:path property.')
      }

      // TODO: validate that the property path is well-formed.

      const propertyPath = propertyPathValues[0]
      const normalizedPropertyPath = normalizePropertyPath(propertyPath, shapesGraph.value)
      

      // Predicate path
      if (propertyPath.termType === 'NamedNode') {
        const orderValues = shapesGraph.value
          .getObjects(propertyShape, sh.order, null)
          .filter((orderValue) => orderValue.termType === 'Literal')
        if (orderValues.length > 1) {
          throw new Error('A property path must contain only one sh:order property.')
        }
        const order = orderValues.length ? Number(orderValues[0].value) : null
        // TODO: sort the labels by preferred language and datatype.
        const labels = shapesGraph.value
          .getObjects(propertyShape, sh.name, null)
          .filter((label) => label.termType === 'Literal')
        const propertyGroupValues = shapesGraph.value
          .getObjects(propertyShape, sh.group, null)
          .filter(
            (propertyGroup) =>
              propertyGroup.termType === 'NamedNode' || propertyGroup.termType === 'BlankNode',
          )
        if (!uiTree.value.propertyPaths.hasOwnProperty(normalizedPropertyPath)) {
          uiTree.value.propertyPaths[normalizedPropertyPath] = {
            term: propertyPath,
            propertyShapes: [propertyShape],
            order,
            labels,
            propertyGroups: propertyGroupValues,
          }
        } else {
          uiTree.value.propertyPaths[normalizedPropertyPath].propertyShapes.push(propertyShape)
          uiTree.value.propertyPaths[normalizedPropertyPath].order = order
          uiTree.value.propertyPaths[normalizedPropertyPath].labels =
            uiTree.value.propertyPaths[normalizedPropertyPath].labels.concat(labels)
          uiTree.value.propertyPaths[normalizedPropertyPath].propertyGroups =
            uiTree.value.propertyPaths[normalizedPropertyPath].propertyGroups.concat(
              propertyGroupValues,
            )
        }
      }

      // TODO: sequence path
      // Alternative path
      // Inverse path
      // TODO: Zero-or-more path
      // TODO: One-or-more path
      // TODO: Zero-or-one path
    }

    // Add the property paths to the property groups.
    for (const propertyGroup of uiTree.value.propertyGroups) {
      for (const propertyPathKey of Object.keys(uiTree.value.propertyPaths)) {
        const propertyGroups = uiTree.value.propertyPaths[propertyPathKey].propertyGroups.map(
          (propertyGroup) => propertyGroup.value,
        )
        if (propertyGroups.includes(propertyGroup.term.value)) {
          propertyGroup.propertyPaths.push({
            value: propertyPathKey,
            order: uiTree.value.propertyPaths[propertyPathKey].order,
          })
        }
      }
    }

    // Sort the property paths by order.
    for (const propertyGroup of uiTree.value.propertyGroups) {
      propertyGroup.propertyPaths.sort((a, b) => {
        return sortWithNulls(a.order, b.order)
      })
    }
  }
}
</script>

<template>
  <FocusNode
    :ui-tree="uiTree"
    :data-graph="dataGraph"
    :shapes-graph="shapesGraph"
    :is-root-node="true"
  />

  <div class="pt-8">
    UI Tree:
    <pre class="overflow-x-auto bg-gray-100 p-4">{{ uiTree }}</pre>
  </div>
</template>
