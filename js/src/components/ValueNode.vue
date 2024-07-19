<script setup lang="ts">
import type { SIdentifiedNode, STerm } from '@/types'
import { useShui } from '@/composables/shui'
import { computed, ref } from 'vue'
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

interface Props {
  subject: SIdentifiedNode
  predicate: NamedNode
  object: STerm
  dataGraph: SIdentifiedNode
  constraintComponents: ConstraintComponent[]
  widgets: Widgets
}

const { subject, predicate, object, dataGraph, widgets } = defineProps<Props>()
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

const handleDelete = () => {
  // TODO: If the subject is a blank node, recursively follow any other blank nodes and delete those statements too.
  // We don't want dangling blank nodes in the data.
  removeQuads([quad(subject, predicate, object, dataGraph)])
}

const viewers = computed(() => {
  return widgets.viewers
})
const editors = computed(() => {
  return widgets.editors
})

// TODO: Can we create a computed property for the viewer and editor and assign a component as its value? JSX?
</script>

<template>
  <div class="flex flex-row">
    <div class="content flex-auto">
      <template v-if="widgets.editors.length && editors[0].type.equals(dash.BooleanSelectEditor)">
        <BooleanSelectEditor :term="object as Literal" @update="handleUpdate" />
      </template>
      <template v-else-if="widgets.editors.length && editors[0].type.equals(dash.DetailsEditor)">
        <FocusNode :focus-node="object as SIdentifiedNode" :data-graph="dataGraph" />
      </template>
      <template v-else-if="editors.length && editors[0].type.equals(dash.LiteralEditor)">
        <LiteralEditor :term="object as SLiteral" @update="handleUpdate" />
      </template>
      <template v-else-if="editors.length && editors[0].type.equals(dash.URIEditor)">
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
        <Button
          icon="pi pi-trash"
          aria-label="Submit"
          severity="danger"
          @click="handleDelete"
          outlined
        />
      </div>
    </div>
  </div>

  <div class="flex flex-row-reverse space-x-2 space-x-reverse"></div>
</template>
