<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { ref, toRef } from 'vue'
import Button from 'primevue/button'
import TieredMenu from 'primevue/tieredmenu'
import { DataFactory } from 'n3'
import literal = DataFactory.literal
import namedNode = DataFactory.namedNode
import blankNode = DataFactory.blankNode

import ValueNode from '@/components/ValueNode.vue'
import { useShui } from '@/composables/shui'
import { SBlankNode, SLiteral, type SNamedNode } from '@/shui'
import type { PredicateConstraints } from '@/types'
import { getWidgets } from '@/core/widgets/score-widget'

interface Props {
  focusNode: SNamedNode | SBlankNode
  dataGraph: SNamedNode | SBlankNode
  predicateObject: PredicateConstraints
}

const props = defineProps<Props>()
const predicateObject = toRef(props, 'predicateObject')

const { shui } = useShui()

const overlayMenuId = `a${uuidv4()}`
const menu = ref()
const items = ref([
  {
    label: 'Add an IRI value',
    command: () => addNewValue(shui.value.toSTerm(namedNode('')))
  },
  {
    label: 'Add a literal value with a language tag',
    command: () => addNewValue(shui.value.toSTerm(literal('', 'en')))
  }
  // {
  //   label: 'Add a literal value with a datatype',
  //   command: () => addNewValue(shui.value.toSTerm(literal('')))
  // }
])
const toggleAddNewValueDropdown = (event: Event) => {
  menu.value.toggle(event)
}

function addNewValue(term: SNamedNode | SBlankNode | SLiteral) {
  const values = predicateObject.value.values

  const newValue = {
    term: term,
    widgets: getWidgets(term, predicateObject.value.constraintComponents)
  }

  values.push(newValue)
}

function handleAddNewDefaultValue() {
  const values = predicateObject.value.values

  if (values.length) {
    const prevValue = values[values.length - 1]
    if (prevValue.term.termType === 'Literal') {
      const newValue = {
        term: shui.value.toSTerm(literal('', prevValue.term.language || prevValue.term.datatype)),
        widgets: prevValue.widgets
      }
      values.push(newValue)
    } else if (prevValue.term.termType === 'NamedNode') {
      const newValue = {
        term: shui.value.toSTerm(namedNode('')),
        widgets: prevValue.widgets
      }
      values.push(newValue)
    } else {
      const newValue = {
        term: shui.value.toSTerm(blankNode('')),
        widgets: prevValue.widgets
      }
      values.push(newValue)
    }
  } else {
    console.log('Cannot create')
  }

  // TODO: What if there are no pre-existing values? Infer from constraint components?
  // TODO: look at the constraint components and determine whether to create an IRI or literal + datatype or literal + lang.
}
</script>

<template>
  <div class="flex flex-col">
    <div class="min-w-[20%] max-w-[30%]">
      <label class="font-bold">{{ shui.toSNamedNode(predicateObject.term).label }}</label>
    </div>

    <div class="grow space-y-4">
      <template v-for="valueObject in predicateObject.values" :key="valueObject.term.id">
        <ValueNode
          :subject="focusNode"
          :predicate="predicateObject.term"
          :object="shui.toSTerm(valueObject.term)"
          :data-graph="dataGraph"
          :constraint-components="predicateObject.constraintComponents"
          :widgets="valueObject.widgets"
          :editor="predicateObject.editor || null"
        />
      </template>
    </div>
  </div>

  <div class="flex flex-row-reverse gap-2 p-3">
    <!-- Button disabled for now. Will need more work to correctly infer what the
    default value should be by inspecting existing values and available constraint
    components -->
    <!--    <Button-->
    <!--      @click="handleAddNewDefaultValue"-->
    <!--      icon="pi pi-plus"-->
    <!--      aria-label="Submit"-->
    <!--      v-tooltip.bottom="'Add new value'"-->
    <!--      disabled-->
    <!--      outlined-->
    <!--    />-->

    <Button
      icon="pi pi-angle-down"
      aria-label="Add new"
      aria-haspopup="true"
      :aria-controls="overlayMenuId"
      @click="toggleAddNewValueDropdown"
      severity="secondary"
      v-tooltip.bottom="'Add new value by type'"
    />
    <TieredMenu ref="menu" :id="overlayMenuId" :model="items" popup />
  </div>
</template>
