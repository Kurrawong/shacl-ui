<script setup lang="ts">
import { onMounted } from 'vue'
import { useShui } from '@/composables/shui.js'
import { DataFactory, Parser, Store } from 'n3'
import quad = DataFactory.quad
import SideNav from '@/components/vocpub/SideNav.vue'
import Page from '@/components/vocpub/Page.vue'
import {DATA_GRAPH, SHACL_GRAPH} from '@/components/vocpub/constants.js'
import vocpub from "@/assets/vocpub.ttl?raw"

interface Props {
  data: string
}

const props = defineProps<Props>()
// const graphNameTerm = namedNode("urn:graph:data")
const store = new Store()
const { addQuads, reset } = useShui()

onMounted(() => {
  reset()
  const parser = new Parser()
  const quads = parser
    .parse(props.data)
    .map((q) => quad(q.subject, q.predicate, q.object, DATA_GRAPH))
  addQuads(quads)

  const shaclQuads = parser
    .parse(vocpub)
    .map((q) => quad(q.subject, q.predicate, q.object, SHACL_GRAPH))
  addQuads(shaclQuads)

  // Add a copy of the quads into the local store.
  // This store is used later when the user performs the "save" action
  // to get a diff on what changes were made to the shui store.
  store.addQuads(quads)
  store.addQuads(shaclQuads)
})
</script>

<template>
  <Page>
    <template #side-nav>
      <SideNav />
    </template>

    <div>Select a resource on the left to get started.</div>
  </Page>
</template>
