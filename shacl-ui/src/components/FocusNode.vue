<script setup lang="ts">
import { computed } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { sh, rdfs } from '@/core/namespaces'
import { sortWithNulls } from '@/core/utils'
import PropertyGroup from '@/components/PropertyGroup.vue'
import { providePredicateTracker } from '@/composables/predicate-tracking'
import TermSet from '@rdfjs/term-set'
import OtherPropertiesGroup from '@/components/OtherPropertiesGroup.vue'
import { provideFocusNode } from '@/composables/focus-node'
import { useResourceManagerContext } from '@/composables/resource-manager'

const props = withDefaults(
  defineProps<{
    focusNode: NamedNode | BlankNode
    nodeShape?: NamedNode | BlankNode | null
  }>(),
  {
    nodeShape: null,
  },
)

const { dataGraphPointer, validator } = useResourceManagerContext()

provideFocusNode(props.focusNode)

const predicates = computed(() => {
  return Array.from(dataGraphPointer.value.dataset.match(props.focusNode, null, null)).map(
    (quad) => quad.predicate as NamedNode,
  )
})

const { getPredicates } = providePredicateTracker(predicates)

const propertyShapesWithoutGroups = computed<Shape[]>(() => {
  if (!props.nodeShape) {
    return []
  }

  const propertyShapes = validator.value.$shapes
    .node(props.nodeShape)
    .out(sh.property)
    .terms.filter(
      (propertyShape) =>
        propertyShape.termType === 'NamedNode' || propertyShape.termType === 'BlankNode',
    )
  const propertyShapesSet = new TermSet(propertyShapes)
  const propertyShapesWithGroups = new TermSet(
    propertyShapes.filter((propertyShape) => {
      return validator.value.$shapes.node(propertyShape).out(sh.group).terms.length > 0
    }),
  ) as TermSet<NamedNode | BlankNode>
  const propertyShapesWithoutGroups = Array.from(propertyShapesSet).filter(
    (propertyShape) => !propertyShapesWithGroups.has(propertyShape),
  )

  return Array.from(propertyShapesWithoutGroups).map(
    (propertyShape) => new Shape(validator.value, propertyShape),
  )
})

const propertyGroups = computed<
  {
    term: NamedNode | BlankNode
    order: number | null
    labels: Literal[]
    propertyShapes: Shape[]
  }[]
>(() => {
  if (!props.nodeShape) {
    return []
  }

  const propertyShapes = validator.value.$shapes
    .node(props.nodeShape)
    .out(sh.property)
    .toArray()
    .map((propertyShape) => propertyShape.term)
    .filter(
      (propertyShape) =>
        propertyShape.termType === 'NamedNode' || propertyShape.termType === 'BlankNode',
    )
    .map((propertyShape) => new Shape(validator.value, propertyShape))

  const propertyGroups = new TermSet<NamedNode | BlankNode>()
  for (const propertyShape of propertyShapes) {
    const propertyGroupValues = validator.value.$shapes
      .node(propertyShape.shapeNode)
      .out(sh.group)
      .toArray()
      .map((propertyGroup) => propertyGroup.term)
      .filter(
        (propertyGroup) =>
          propertyGroup.termType === 'NamedNode' || propertyGroup.termType === 'BlankNode',
      )
    for (const propertyGroupValue of propertyGroupValues) {
      propertyGroups.add(propertyGroupValue)
    }
  }

  return Array.from(propertyGroups)
    .map((propertyGroup) => {
      const orderValues = validator.value.$shapes
        .node(propertyGroup)
        .out(sh.order)
        .toArray()
        .filter((orderValue) => orderValue.term.termType === 'Literal')
      if (orderValues.length > 1) {
        throw new Error('A property group must contain only one sh:order property.')
      }
      const order = orderValues.length ? Number(orderValues[0].value) : null
      const labels = validator.value.$shapes
        .node(propertyGroup)
        .out(rdfs.label)
        .toArray()
        .map((label) => label.term)
        .filter((label) => label.termType === 'Literal')

      const propertyGroupShapes = propertyShapes
        .filter((propertyShape) => {
          const propertyGroupValues = validator.value.$shapes
            .node(propertyShape.shapeNode)
            .out(sh.group)
            .toArray()
            .map((propertyGroup) => propertyGroup.term)
          return propertyGroupValues.some((propertyGroupValue) =>
            propertyGroupValue.equals(propertyGroup),
          )
        })
        .sort((a, b) => {
          const aPath = a.shapeNodePointer.out(sh.path).term?.value
          const bPath = b.shapeNodePointer.out(sh.path).term?.value
          return aPath?.localeCompare(bPath ?? '', undefined, { sensitivity: 'base' }) ?? 0
        })
        .sort((a, b) =>
          sortWithNulls(
            a.shapeNodePointer.out(sh.order).term
              ? Number(a.shapeNodePointer.out(sh.order).term?.value)
              : null,
            b.shapeNodePointer.out(sh.order).term
              ? Number(b.shapeNodePointer.out(sh.order).term?.value)
              : null,
          ),
        )
      return {
        term: propertyGroup,
        order,
        labels,
        propertyShapes: propertyGroupShapes,
      }
    })
    .sort((a, b) => sortWithNulls(a.order, b.order))
})
</script>

<template>
  <div class="space-y-4 grow">
    <template v-if="propertyGroups.length > 0">
      <div v-for="propertyGroup in propertyGroups" :key="propertyGroup.term?.value">
        <PropertyGroup
          :term="propertyGroup.term"
          :order="propertyGroup.order"
          :labels="propertyGroup.labels"
          :property-shapes="propertyGroup.propertyShapes"
        />
      </div>
    </template>

    <OtherPropertiesGroup
      v-if="propertyShapesWithoutGroups.length > 0 || getPredicates().length > 0"
      :property-shapes="propertyShapesWithoutGroups"
      :predicates="getPredicates()"
    />
  </div>
</template>
