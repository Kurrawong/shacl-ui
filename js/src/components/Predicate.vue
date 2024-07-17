<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Button from 'primevue/button'
import TieredMenu from 'primevue/tieredmenu'
import type { SNamedNode } from '@/shui'
import { useShui } from '@/composables/shui'
import Obj from '@/components/Obj.vue'
import type { SIdentifiedNode } from '@/types'
import n3 from 'n3'
import { v4 as uuidv4 } from 'uuid'

const { quad, namedNode, literal } = n3.DataFactory

interface Props {
  subject: SIdentifiedNode
  predicate: SNamedNode
  graph: SIdentifiedNode
}
const { subject, predicate, graph } = defineProps<Props>()
const { shui, addQuads } = useShui()
const overlayMenuId = `a${uuidv4()}`
const menu = ref()
const items = ref([
  {
    label: 'Add an IRI value',
    command: () => addQuads([quad(subject, predicate, namedNode('urn:iri:new'), graph)])
  },
  {
    label: 'Add a literal value with a language tag',
    command: () =>
      addQuads([quad(subject, predicate, shui.value.toSTerm(literal('', 'en')), graph)])
  },
  {
    label: 'Add a literal value with a datatype',
    command: () => addQuads([quad(subject, predicate, shui.value.toSTerm(literal('')), graph)])
  }
])
const addToggle = (event: Event) => {
  menu.value.toggle(event)
}
</script>

<template>
  <Card>
    <template #title
      >{{ predicate.label }}
      <Chip
        v-tooltip="predicate.value"
        label="IRI"
        :pt="{
          label: {
            class: 'text-sm'
          }
        }"
      />
      <div class="space-y-4 pt-4">
        <template v-for="quad in shui.getQuads(subject, predicate, null, graph)" :key="quad">
          <Obj
            :subject="quad.subject"
            :predicate="quad.predicate"
            :object="quad.object"
            :graph="quad.graph"
          />
        </template>

        <Button
          icon="pi pi-plus"
          aria-label="Add new"
          aria-haspopup="true"
          :aria-controls="overlayMenuId"
          @click="addToggle"
        />
        <TieredMenu ref="menu" :id="overlayMenuId" :model="items" popup />
      </div>
    </template>
  </Card>
</template>
