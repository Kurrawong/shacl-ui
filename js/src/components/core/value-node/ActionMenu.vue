<script setup lang="ts">
import Button from 'primevue/button'
import TieredMenu from 'primevue/tieredmenu'
import { ref } from 'vue'
import { DataFactory, type NamedNode } from 'n3'
import quad = DataFactory.quad
import { useShui } from '@/composables/shui'
import type { SIdentifiedNode, STerm } from '@/types'
import type { Widget, Widgets } from '@/core/widgets/score-widget'
import { v4 as uuidv4 } from 'uuid'
import namedNode = DataFactory.namedNode
import type { MenuItemCommandEvent } from 'primevue/menuitem'

type Item = {
  label: string
  index: number
}

interface Props {
  subject: SIdentifiedNode
  predicate: NamedNode
  object: STerm
  dataGraph: SIdentifiedNode
  widgets: Widgets
  selectedWidget: Widget | null
}
const props = defineProps<Props>()
const emit = defineEmits(['select-widget'])
const { subject, predicate, object, dataGraph, widgets } = props
const { shui, removeQuads } = useShui()
const menuId = `a${uuidv4()}`
const menuRef = ref()

// Items used by the TieredMenu component.
const items = ref([
  {
    label: 'Widgets',
    items: widgets.editors.map((widget, index) => ({
      label: `${shui.value.toSNamedNode(namedNode(widget.type.value)).label} (score ${widget.score})`,
      index,
      command: (event: MenuItemCommandEvent) => {
        const item = event.item as Item
        emit('select-widget', item.index)
      }
    }))
  },
  {
    separator: true
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => handleDelete()
  }
])

const handleDelete = () => {
  // TODO: If the subject is a blank node, recursively follow any other blank nodes and delete those statements too.
  // We don't want dangling blank nodes in the data.
  removeQuads([quad(subject, predicate, object, dataGraph)])
}
</script>

<template>
  <Button
    icon="pi pi-ellipsis-v"
    aria-label="Add new"
    aria-haspopup="true"
    :aria-controls="menuId"
    @click="(event: Event) => menuRef.toggle(event)"
    severity="secondary"
    v-tooltip.bottom="'Add new value by type'"
  />
  <TieredMenu ref="menuRef" :id="menuId" :model="items" popup />
</template>
