<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import Fieldset from 'primevue/fieldset'
import { SBlankNode, type SNamedNode } from '@/core/shui'
import { useShui } from '@/composables/shui'
import type { PredicateConstraints, PropertyGroupsMap, UISchema } from '@/types'
import PredicatesObjectValues from '@/components/PredicatesObjectValues.vue'

interface Props {
  focusNode: SNamedNode | SBlankNode
  nodeShape?: SNamedNode | SBlankNode
  dataGraph: SNamedNode | SBlankNode
  isRootNode?: boolean
}
const props = withDefaults(defineProps<Props>(), { isRootNode: false })
const focusNode = toRef(props, 'focusNode')
const nodeShape = toRef(props, 'nodeShape')
const dataGraph = toRef(props, 'dataGraph')
const { shui } = useShui()
const uiSchema = ref<UISchema>()
const predicateObjectValues = ref<PredicateConstraints[]>([])

async function updateValues() {
  uiSchema.value = await shui.value.getSchema(focusNode.value, dataGraph.value, nodeShape.value)
  predicateObjectValues.value = Array.from(
    Object.entries(uiSchema.value?.[focusNode.value.value].predicates)
      .map((value) => value[1])
      .values()
  )
  console.log(uiSchema.value)
}

onMounted(async () => {
  await updateValues()
})
watch([shui, focusNode, nodeShape], async () => {
  await updateValues()
})

const propertyGroups = computed(() => {
  const propertyGroupsMap = uiSchema.value?.[focusNode.value.value]?.groups as PropertyGroupsMap
  if (!propertyGroupsMap) {
    return []
  }

  return Array.from(propertyGroupsMap.values()).sort((a, b) => {
    if (a.order < b.order) {
      return -1
    }
    if (a.order > b.order) {
      return 1
    }
    return 0
  })
})
</script>

<template>
  <template v-if="uiSchema">
    <div v-for="(propertyGroup, index) in propertyGroups" :key="propertyGroup.term.id">
      <Fieldset
        :legend="propertyGroup.name"
        :toggleable="true"
        :collapsed="index !== 0"
        :pt="{
          legend: {
            class: 'text-lg font-bold pt-4'
          },
          root: {
            class: 'p-4 outline outline-1 outline-gray-300'
          }
        }"
      >
        <div class="space-y-2 pt-4">
          <PredicatesObjectValues
            :focus-node="focusNode"
            :data-graph="dataGraph"
            :predicate-object-values="predicateObjectValues"
            :group-filter="propertyGroup.term"
          />
        </div>
      </Fieldset>
    </div>

    <div>
      <Fieldset
        legend="Properties"
        :toggleable="true"
        :collapsed="propertyGroups.length > 0"
        :pt="{
          legend: {
            class: 'text-lg font-bold pt-4'
          },
          root: {
            class: 'p-4 outline outline-1 outline-gray-300'
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
    </div>
  </template>
</template>
