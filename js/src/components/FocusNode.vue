<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import Fieldset from 'primevue/fieldset'
import { SBlankNode, type SNamedNode } from '@/shui'
import { useShui } from '@/composables/shui'
import type { PropertyGroupsMap, UISchema } from '@/types'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import ValueNode from '@/components/ValueNode.vue'

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

function filterPredicateObjectValuesByGroup(group: NamedNode | BlankNode | null) {
  if (group === null) {
    return predicateObjectValues.value.filter((value) => value.group === null)
  }
  return predicateObjectValues.value.filter((value) => value.group?.equals(group))
}
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
          <template
            v-for="predicateObject in filterPredicateObjectValuesByGroup(propertyGroup.term)"
            :key="predicateObject.term.id"
          >
            <div class="flex flex-row">
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
                  />
                </template>
              </div>
            </div>
          </template>
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
      <div class="space-y-4 pt-4">
        <template
          v-for="predicateObject in filterPredicateObjectValuesByGroup(null)"
          :key="predicateObject.term.id"
        >
          <div class="flex flex-row">
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
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </Fieldset>
  </template>
</template>
