<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { rdf, skos } from '@/core/namespaces.js'
import { useShui } from '@/composables/shui.js'
import { NamedNode, type Quad_Subject } from 'n3'
import Menu from 'primevue/menu'

const router = useRouter()
const { shui } = useShui()

function getConceptLabel(iri: Quad_Subject | NamedNode) {
  const labels = shui.value.store.getObjects(iri, skos.prefLabel, null)
  if (labels && labels.length > 0) {
    return labels[0].value
  }
  return iri.value
}

const items = computed(() => {
  let _items: any = []
  const store = shui.value.store
  const conceptScheme = (() => {
    const conceptSchemes = store.getSubjects(rdf.type, skos.ConceptScheme, null)
    return conceptSchemes.map((c) => ({
      label: getConceptLabel(c),
      command: () => {
        router.push({ name: 'resource', query: { iri: c.value } })
      }
    }))[0]
  })()

  const concepts = (() => {
    const concepts = store.getSubjects(rdf.type, skos.Concept, null)
    return concepts.map((c) => ({
      label: getConceptLabel(c),
      command: () => {
        router.push({ name: 'resource', query: { iri: c.value } })
      }
    })).sort((a, b) => {
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
