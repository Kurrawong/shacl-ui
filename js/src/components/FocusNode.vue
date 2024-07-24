<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import Fieldset from 'primevue/fieldset'
import { SBlankNode, type SNamedNode } from '@/shui'
import { useShui } from '@/composables/shui'
import type { PropertyGroupsMap, UISchema } from '@/types'
import PredicatesObjectValues from '@/components/PredicatesObjectValues.vue'

interface Props {
  focusNode: SNamedNode | SBlankNode
  nodeShape?: SNamedNode | SBlankNode
  dataGraph: SNamedNode | SBlankNode
}
const props = defineProps<Props>()
const focusNode = toRef(props, 'focusNode')
const nodeShape = toRef(props, 'nodeShape')
const dataGraph = toRef(props, 'dataGraph')
const { shui } = useShui()
const uiSchema = ref<UISchema>()

onMounted(async () => {
  uiSchema.value = await shui.value.getSchema(focusNode.value, dataGraph.value, nodeShape.value)
  console.log(uiSchema.value)
})
watch([shui, nodeShape], async () => {
  uiSchema.value = await shui.value.getSchema(focusNode.value, dataGraph.value, nodeShape.value)
  console.log(uiSchema.value)
})

const predicateObjectValues = computed(() => {
  if (!uiSchema.value) {
    return []
  }
  return Array.from(
    Object.entries(uiSchema.value?.[focusNode.value.value].predicates)
      .map((value) => value[1])
      .values()
  )
})

const propertyGroups = computed(() => {
  const propertyGroupsMap = uiSchema.value?.[focusNode.value.value].groups as PropertyGroupsMap
  if (!propertyGroupsMap) {
    return []
  }

  return Array.from(propertyGroupsMap.values()).sort((a, b) => {
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
  <template v-if="uiSchema">
    <template v-if="propertyGroups">
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
          <PredicatesObjectValues
            :focus-node="focusNode"
            :data-graph="dataGraph"
            :predicate-object-values="predicateObjectValues"
            :group-filter="propertyGroup.term"
          />
        </div>
      </Fieldset>
    </template>

    <Fieldset
      legend="Other Properties"
      :pt="{
        legend: {
          class: 'text-lg font-bold'
        }
      }"
    >
      <div class="space-y-2 pt-4">
        <PredicatesObjectValues
          :focus-node="focusNode"
          :data-graph="dataGraph"
          :predicate-object-values="predicateObjectValues"
          :group-filter="null"
        />
      </div>
    </Fieldset>
  </template>
</template>
