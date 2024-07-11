<script setup lang="ts">
import { useShui } from '@/composables/shui'
import type { SIdentifiedNode } from '@/types'
import Predicate from '@/components/Predicate.vue'

interface Props {
  subject: SIdentifiedNode
  graph: SIdentifiedNode
}
defineProps<Props>()
const { shui } = useShui()
</script>

<template>
  <!--  <div class="border border-indigo-600">-->
  <div class="space-y-4">
    <div v-if="subject.termType === 'NamedNode'">
      <h1 class="text-2xl">{{ subject.label }}</h1>
      Identifier:
      <pre class="inline">{{ subject.id }}</pre>
    </div>

    <div v-for="predicate in shui.getPredicates(subject, null, graph)" :key="predicate.id">
      <Predicate :subject="subject" :predicate="predicate" :graph="graph" />
    </div>
  </div>
  <!--  </div>-->
</template>
