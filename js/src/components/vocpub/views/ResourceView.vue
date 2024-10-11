<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Chip from 'primevue/chip'
import SideNav from '@/components/vocpub/SideNav.vue'
import Page from '@/components/vocpub/Page.vue'
import FocusNode from '@/components/FocusNode.vue'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode
import { DATA_GRAPH } from '@/components/vocpub/constants.js'
import { useShui } from '@/composables/shui.js'
import { getConceptLabel } from '@/components/vocpub/queries.js'
import { rdf } from '@/core/namespaces.js'

const route = useRoute()
const { shui } = useShui()
const iri = computed(() => route.query.iri || '')
const focusNodeTerm = computed(() => namedNode(iri.value.toString()))
const label = computed(() => {
  return getConceptLabel(focusNodeTerm.value, shui.value.store)
})
const resourceType = computed(() => {
  const types = shui.value.store.getObjects(focusNodeTerm.value, rdf.type, null)
  for (const t of types) {
    if (t.value.includes('http://www.w3.org/2004/02/skos/core#')) {
      return t.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
    }
  }
  return null
})
</script>

<template>
  <Page>
    <template #side-nav>
      <SideNav />
    </template>

    <div class="space-y-4">
      <h1 class="text-2xl font-bold">{{ label }}</h1>
      <Chip v-if="resourceType" :label="resourceType" />
      <code class="block overflow-x-auto">{{ iri }}</code>
      <FocusNode :focus-node="focusNodeTerm" :data-graph="DATA_GRAPH" :node-shape="null" />
    </div>
  </Page>
</template>
