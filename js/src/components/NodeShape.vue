<script setup lang="ts">
import { computed, watch, ref, toRef, onMounted } from 'vue'
import Fieldset from 'primevue/fieldset'
import InputText from 'primevue/inputtext'
import { useShui } from '@/composables/shui'
import type { PropertyGroupsMap, PredicatesShapesMap } from '@/types'
import TieredMenu from 'primevue/tieredmenu'
import Obj from '@/components/Obj.vue'
import Button from 'primevue/button'
import { SBlankNode, type SNamedNode } from '@/shui'

interface Props {
  subject: SNamedNode
  nodeShape: SNamedNode | SBlankNode
  graph: SNamedNode | SBlankNode
}

const props = defineProps<Props>()
const subject = toRef(props, 'subject')
const nodeShape = toRef(props, 'nodeShape')
const graph = toRef(props, 'graph')
const { shui, addQuads, parse, reset } = useShui()
const predicatesMap = ref<PredicatesShapesMap>()
const propertyGroupsMap = ref<PropertyGroupsMap>()

const getMaps = async () => {
  const { predicatesMap: pMap, propertyGroupsMap: pgMap } = await shui.value.getPredicatesShapesMap(
    subject.value,
    nodeShape.value,
    graph.value
  )
  predicatesMap.value = pMap
  propertyGroupsMap.value = pgMap
}

onMounted(async () => {
  await getMaps()
})
watch(shui.value, async () => {
  await getMaps()
})

const propertyGroups = computed(() => {
  if (!propertyGroupsMap.value) {
    return []
  }

  return Array.from(propertyGroupsMap.value.values()).sort((a, b) => {
    if (a.order < b.order) {
      return 1
    }
    if (a.order > b.order) {
      return -1
    }
    return 0
  })
})
</script>

<template>
  <div v-if="propertyGroupsMap">
    <Fieldset
      v-for="propertyGroup in propertyGroups"
      :key="propertyGroup.term.id"
      :legend="propertyGroup.name"
      :pt="{
        legend: {
          class: 'text-lg font-bold'
        }
      }"
    >
      <div class="space-y-4 pt-4">
        <template
          v-for="predicateMapValue in Array.from(predicatesMap?.values() ?? []).filter((value) =>
            value.group?.equals(propertyGroup.term)
          )"
          :key="predicateMapValue.predicate.id"
        >
          <p class="font-bold">{{ predicateMapValue.predicate.label }}</p>
          <template v-for="obj in predicateMapValue.terms" :key="obj.id">
            <Obj
              :subject="subject"
              :predicate="predicateMapValue.predicate"
              :object="obj"
              :graph="graph"
            />
          </template>
        </template>

        <!--        <Button-->
        <!--          icon="pi pi-plus"-->
        <!--          aria-label="Add new"-->
        <!--          aria-haspopup="true"-->
        <!--          :aria-controls="overlayMenuId"-->
        <!--          @click="addToggle"-->
        <!--        />-->
        <!--        <TieredMenu ref="menu" :id="overlayMenuId" :model="items" popup />-->
      </div>

      <!--      <dd>Name: {{ value.group?.name }} {{ value.group?.term.value }}</dd>-->
    </Fieldset>
  </div>
</template>
