<script setup lang="ts">
import type { SIdentifiedNode, STerm } from '@/types'
import { useShui } from '@/composables/shui'
import { computed, ref, toRef } from 'vue'
import { type BlankNode, DataFactory, type Literal, type NamedNode } from 'n3'
import quad = DataFactory.quad
import type { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Widgets } from '@/core/widgets/score-widget'
import { dash } from '@/core/namespaces'
import LiteralEditor from '@/components/dash/editors/LiteralEditor.vue'
import type { SLiteral } from '@/shui'
import Button from 'primevue/button'
import BooleanSelectEditor from '@/components/dash/editors/BooleanSelectEditor.vue'
import URIEditor from '@/components/dash/editors/URIEditor.vue'
import FocusNode from '@/components/FocusNode.vue'
import ActionMenu from '@/components/core/value-node/ActionMenu.vue'
import BlankNodeEditor from '@/components/dash/editors/BlankNodeEditor.vue'

interface Props {
  subject: SIdentifiedNode
  predicate: NamedNode
  object: STerm
  dataGraph: SIdentifiedNode
  constraintComponents: ConstraintComponent[]
  widgets: Widgets
}

const props = defineProps<Props>()
const { subject, predicate, object, dataGraph } = props
const widgets = toRef(props, 'widgets')
// TODO: Only considers editors at the moment.
const selectedWidget = ref(widgets.value.editors.length ? widgets.value.editors[0] : null)
const { addQuads, removeQuads } = useShui()
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
  return object.termType !== 'BlankNode' && !selectedWidget.value?.type.equals(dash.DetailsEditor)
})

// TODO: Can we create a computed property for the viewer and editor and assign a component as its value? JSX?
</script>

<template>
  <div class="flex flex-row p-3 bg-slate-50" :class="isHoverGreen ? 'hover:bg-green-100' : ''">
    <div class="content flex-auto">
      <template v-if="selectedWidget?.type.equals(dash.BlankNodeEditor)">
        <BlankNodeEditor :term="object as BlankNode" @update="handleUpdate" />
      </template>
      <template v-else-if="selectedWidget?.type.equals(dash.BooleanSelectEditor)">
        <BooleanSelectEditor :term="object as Literal" @update="handleUpdate" />
      </template>
      <template v-else-if="selectedWidget?.type.equals(dash.DetailsEditor)">
        <FocusNode :focus-node="object as SIdentifiedNode" :data-graph="dataGraph" />
      </template>
      <template v-else-if="selectedWidget?.type.equals(dash.LiteralEditor)">
        <LiteralEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>
      <template v-else-if="selectedWidget?.type.equals(dash.URIEditor)">
        <URIEditor :term="object as NamedNode" @update="handleUpdate" />
      </template>
      <template v-else>
        <p>{{ object.id }}</p>
        <small class="text-yellow-600"
          ><i class="pi pi-exclamation-triangle pr-1"></i>No suitable widget found.</small
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
