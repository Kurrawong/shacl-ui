<script setup lang="ts">
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { ref, watch } from 'vue'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode
import RDFTextarea from '@/components/playground/RDFTextarea.vue'
import { useShui } from '@/composables/shui'
import exampleData from '@/components/playground/example-data'

const { shui } = useShui()
const shacl = ref('')
const shaclUpdated = ref(false)
const data = ref('')
const dataUpdated = ref(false)

const examplesMenu = ref()
const exampleItems = ref(
  exampleData.map((item) => ({
    label: item.label,
    command: () => {
      shacl.value = item.shacl
      data.value = item.data
      shaclUpdated.value = true
      dataUpdated.value = true
    }
  }))
)

watch(shui, () => {
  if (!shaclUpdated.value && !dataUpdated.value) {
    data.value = shui.value.quadsToString(namedNode('urn:graph:data'))
  }
})
</script>

<template>
  <Button
    label="Examples"
    @click="(event: Event) => examplesMenu.toggle(event)"
    aria-haspopup="true"
    aria-controls="examples_menu"
  />
  <Menu ref="examplesMenu" id="examples_menu" :model="exampleItems" popup />
  <RDFTextarea
    label="SHACL Shapes"
    v-model="shacl"
    v-model:updated="shaclUpdated"
    graph="urn:system:graph:shacl"
  />
  <RDFTextarea label="Data" v-model="data" v-model:updated="dataUpdated" graph="urn:graph:data" />
</template>
