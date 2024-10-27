<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import Button from 'primevue/button'
import { type BlankNode, DataFactory, type Literal, type NamedNode } from 'n3'
import quad = DataFactory.quad

import type { SIdentifiedNode, STerm } from '@/types'
import type { Widgets } from '@/core/widgets/score-widget'
import type { SLiteral } from '@/core/shui'
import { useShui } from '@/composables/shui'
import { NodeConstraintComponent } from '@/core/constraint-components/shape-based/node'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import AutoCompleteEditor from '@/components/dash/editors/AutoCompleteEditor.vue'
import LiteralEditor from '@/components/dash/editors/LiteralEditor.vue'
import BooleanSelectEditor from '@/components/dash/editors/BooleanSelectEditor.vue'
import URIEditor from '@/components/dash/editors/URIEditor.vue'
import FocusNode from '@/components/FocusNode.vue'
import ActionMenu from '@/components/core/value-node/ActionMenu.vue'
import BlankNodeEditor from '@/components/dash/editors/BlankNodeEditor.vue'
import TextAreaEditor from '@/components/dash/editors/TextAreaEditor.vue'
import TextAreaWithLangEditor from '@/components/dash/editors/TextAreaWithLangEditor.vue'
import TextFieldEditor from '@/components/dash/editors/TextFieldEditor.vue'
import TextFieldWithLangEditor from '@/components/dash/editors/TextFieldWithLangEditor.vue'
import DatePickerEditor from './dash/editors/DatePickerEditor.vue'
import { dash, sh } from '@/core/namespaces'

interface Props {
  subject: SIdentifiedNode
  predicate: NamedNode
  object: STerm
  dataGraph: SIdentifiedNode
  constraintComponents: ConstraintComponent[]
  widgets: Widgets
  editor: NamedNode | null
}

function getDefaultWidget() {
  if (editor !== null) {
    return {
      type: editor,
      score: null
    }
  }
  return widgets.value.editors.length ? widgets.value.editors[0] : null
}

const props = defineProps<Props>()
const { subject, predicate, object, dataGraph, constraintComponents, editor } = props
const widgets = toRef(props, 'widgets')
// TODO: Only considers editors at the moment.
const selectedWidget = ref(getDefaultWidget())
const { shui, addQuads, removeQuads } = useShui()
const newValue = ref()
const updated = ref(false)

const handleSave = () => {
  removeQuads([quad(subject, predicate, object, dataGraph)])
  addQuads([quad(subject, predicate, newValue.value, dataGraph)])
  updated.value = false
}
const handleUpdate = (value: NamedNode | BlankNode | Literal) => {
  updated.value = true
  newValue.value = value
}

const isHoverGreen = computed(() => {
  return (
    object.termType !== 'BlankNode' ||
    (selectedWidget.value?.type && !selectedWidget.value.type.equals(dash.DetailsEditor))
  )
})

const detailsEditorNodeShapes = computed(() => {
  for (const constraintComponent of constraintComponents) {
    if (constraintComponent.type.equals(sh.NodeConstraintComponent)) {
      const nodeConstraintComponent = constraintComponent as NodeConstraintComponent
      const terms = []
      for (const nodeTerm of nodeConstraintComponent.nodes) {
        if (nodeTerm.termType === 'NamedNode') {
          terms.push(shui.value.toSNamedNode(nodeTerm))
        } else if (nodeTerm.termType === 'BlankNode') {
          terms.push(shui.value.toSBlankNode(nodeTerm))
        } else {
          throw Error(
            `sh:node values must be NodeShapes. Expecting NamedNodes or BlankNodes, not ${nodeTerm.termType}`
          )
        }
      }
      return terms
    }
  }
  return undefined
})

// TODO: Can we create a computed property for the viewer and editor and assign a component as its value? JSX?
</script>

<template>
  <div class="flex flex-row p-3 bg-slate-50" :class="isHoverGreen ? 'hover:bg-green-100' : ''">
    <div class="content flex-auto">
      <!-- dash:AutoCompleteEditor -->
      <template v-if="selectedWidget?.type.equals(dash.AutoCompleteEditor)">
        <AutoCompleteEditor
          :term="object as NamedNode"
          :constraint-components="constraintComponents"
          :data-graph="dataGraph as NamedNode"
          @update="handleUpdate"
        />
      </template>

      <!-- dash:BlankNodeEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.BlankNodeEditor)">
        <BlankNodeEditor :term="object as BlankNode" @update="handleUpdate" />
      </template>

      <!-- dash:BooleanSelectEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.BooleanSelectEditor)">
        <BooleanSelectEditor :term="object as Literal" @update="handleUpdate" />
      </template>

      <!-- dash:DatePickerEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.DatePickerEditor)">
        <DatePickerEditor :term="object as Literal" @update="handleUpdate" />
      </template>

      <!-- dash:DetailsEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.DetailsEditor)">
        <!-- TODO: it's valid to define multiple sh:node values (i.e., multiple NodeShapes) - perhaps FocusNode component will need to support that in the future -->
        <FocusNode
          :focus-node="object as SIdentifiedNode"
          :data-graph="dataGraph"
          :node-shape="detailsEditorNodeShapes ? detailsEditorNodeShapes[0] : undefined"
        />
      </template>

      <!-- dash:LiteralEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.LiteralEditor)">
        <LiteralEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>

      <!-- dash:TextAreaEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.TextAreaEditor)">
        <TextAreaEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>

      <!-- dash:TextAreaWithLangEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.TextAreaWithLangEditor)">
        <TextAreaWithLangEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>

      <!-- dash:TextFieldEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.TextFieldEditor)">
        <TextFieldEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>

      <!-- dash:TextFieldWithLangEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.TextFieldWithLangEditor)">
        <TextFieldWithLangEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>

      <!-- dash:URIEditor -->
      <template v-else-if="selectedWidget?.type.equals(dash.URIEditor)">
        <URIEditor :term="object as NamedNode" @update="handleUpdate" />
      </template>

      <!-- else -->
      <template v-else>
        <p>{{ object.id }}</p>
        <small class="text-yellow-600"
          ><i class="pi pi-exclamation-triangle pr-1"></i>Widget
          {{ selectedWidget?.type.value }} not found.</small
        >
      </template>
    </div>

    <div class="ml-2">
      <div class="flex flex-row gap-2">
        <Button v-if="updated" icon="pi pi-check" aria-label="Save" @click="handleSave" />
        <ActionMenu
          :subject="subject"
          :predicate="predicate"
          :object="object"
          :data-graph="dataGraph"
          :widgets="widgets"
          :selected-widget="selectedWidget"
          @select-widget="(index: number) => (selectedWidget = widgets.editors[index])"
        />
      </div>
    </div>
  </div>
</template>
