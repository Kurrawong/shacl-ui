<script setup lang="ts">
import { useRoute } from 'vue-router'
import SideNav from '@/components/vocpub/SideNav.vue'
import Page from '@/components/vocpub/Page.vue'
import FocusNode from '@/components/FocusNode.vue'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode
import { DATA_GRAPH } from '@/components/vocpub/constants.js'
import { computed, ref } from 'vue'

const route = useRoute()
const focusNodeTerm = computed(() => {
  return route.query?.iri ? namedNode(route.query.iri.toString()) : null
})
</script>

<template>
  <Page>
    <template #side-nav>
      <SideNav />
    </template>

    <p>Resource View</p>
    <div>IRI: {{ route.query.iri }}</div>

    <FocusNode :focus-node="focusNodeTerm" :data-graph="DATA_GRAPH" :node-shape="null" />
  </Page>
</template>
