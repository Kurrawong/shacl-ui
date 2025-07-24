<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import TermLabel from '@/components/TermLabel.vue'
import type { AnyPointer } from 'clownface'
import { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { UISHACLValidator } from '@/lib/shapes-graph'
import { sh, rdfs } from '@/lib/namespaces'
import { sortWithNulls } from '@/lib/utils'
import type { PropertyGroupType } from '@/components/PropertyGroup.vue'
import PropertyGroup from '@/components/PropertyGroup.vue'

const { focusNode, nodeShape, validator } = defineProps<{
  focusNode: NamedNode | BlankNode | Literal
  nodeShape: NamedNode | BlankNode | null
  dataGraph: AnyPointer
  validator: UISHACLValidator
  isRootNode: boolean
}>()

const label = ref(focusNode)
const updateLabel = (newLabel: NamedNode | BlankNode | Literal) => {
  label.value = newLabel
}
provide('updateLabel', updateLabel)

const propertyGroups = computed<PropertyGroupType[]>(() => {
  if (!nodeShape) {
    return []
  }

  const propertyShapes = validator.$shapes
    .node(nodeShape)
    .out(sh.property)
    .toArray()
    .map((propertyShape) => propertyShape.term)
    .filter(
      (propertyShape) =>
        propertyShape.termType === 'NamedNode' || propertyShape.termType === 'BlankNode',
    )
    .map((propertyShape) => new Shape(validator, propertyShape))

  const propertyGroupsSeen = new Set<string>()
  const propertyGroups: (NamedNode | BlankNode)[] = []
  for (const propertyShape of propertyShapes) {
    const propertyGroupValues = validator.$shapes
      .node(propertyShape.shapeNode)
      .out(sh.group)
      .toArray()
      .map((propertyGroup) => propertyGroup.term)
      .filter(
        (propertyGroup) =>
          propertyGroup.termType === 'NamedNode' || propertyGroup.termType === 'BlankNode',
      )
    for (const propertyGroupValue of propertyGroupValues) {
      if (!propertyGroupsSeen.has(propertyGroupValue.value)) {
        propertyGroupsSeen.add(propertyGroupValue.value)
        propertyGroups.push(propertyGroupValue)
      }
    }
  }

  return propertyGroups
    .map((propertyGroup) => {
      const orderValues = validator.$shapes
        .node(propertyGroup)
        .out(sh.order)
        .toArray()
        .filter((orderValue) => orderValue.term.termType === 'Literal')
      if (orderValues.length > 1) {
        throw new Error('A property group must contain only one sh:order property.')
      }
      const order = orderValues.length ? Number(orderValues[0].value) : null
      const labels = validator.$shapes
        .node(propertyGroup)
        .out(rdfs.label)
        .toArray()
        .map((label) => label.term)
        .filter((label) => label.termType === 'Literal')

      const propertyGroupShapes = propertyShapes
        .filter((propertyShape) => {
          const propertyGroupValues = validator.$shapes
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
  <TermLabel :term="label" />

  <div v-if="propertyGroups.length > 0" class="space-y-4 mt-4">
    <div v-for="propertyGroup in propertyGroups" :key="propertyGroup.term.value">
      <PropertyGroup
        :term="propertyGroup.term"
        :order="propertyGroup.order"
        :labels="propertyGroup.labels"
        :property-shapes="propertyGroup.propertyShapes"
      />
    </div>
  </div>
</template>
