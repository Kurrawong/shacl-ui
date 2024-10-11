<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { rdf, skos } from '@/core/namespaces.js'
import { useShui } from '@/composables/shui.js'
import Menu from 'primevue/menu'
import { getConceptLabel } from '@/components/vocpub/queries.js'

const router = useRouter()
const { shui } = useShui()

const items = computed(() => {
  let _items: any = []
  const store = shui.value.store
  const conceptScheme = (() => {
    const conceptSchemes = store.getSubjects(rdf.type, skos.ConceptScheme, null)
    return conceptSchemes.map((c) => ({
      label: getConceptLabel(c, store),
      command: () => {
        router.push({ name: 'resource', query: { iri: c.value } })
      }
    }))[0]
  })()

  const concepts = (() => {
    const concepts = store.getSubjects(rdf.type, skos.Concept, null)
    return concepts
      .map((c) => ({
        label: getConceptLabel(c, store),
        command: () => {
          router.push({ name: 'resource', query: { iri: c.value } })
        }
      }))
      .sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
  })()

  if (conceptScheme) {
    _items = _items.concat([
      {
        label: 'Concept Scheme',
        items: [conceptScheme]
      }
    ])
  }

  if (concepts) {
    _items = _items.concat([
      {
        label: 'Concepts',
        items: concepts
      }
    ])
  }

  return _items
})
</script>

<template>
  <Menu :model="items" />
</template>
