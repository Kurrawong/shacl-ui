<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import FocusNode from '@/components/FocusNode.vue'
import { useShui } from '@/composables/shui'
import { DataFactory, Parser, type Quad, Store, Writer } from 'n3'
import quad = DataFactory.quad
import namedNode = DataFactory.namedNode

interface Props {
  focusNode: string
  graphName: string
  nodeShape: string
  nodeShapeData: string
  data: string
  // csrf: string
  submissionUrl: string
  sparqlUrl: string
}

const props = defineProps<Props>()
const toast = useToast()
const { shui, addQuads, reset, setServerMode, setSparqlUrl } = useShui()
const focusNodeTerm = shui.value.toSNamedNode(namedNode(props.focusNode))
const nodeShapeTerm = shui.value.toSNamedNode(namedNode(props.nodeShape))
const graphNameTerm = shui.value.toSNamedNode(namedNode(props.graphName))
const shapeGraphNameTerm = namedNode('urn:system:graph:shacl')

setServerMode(true)
setSparqlUrl(props.sparqlUrl)

const writer = new Writer()
const store = new Store()
const isSaving = ref(false)

onMounted(() => {
  reset()
  const parser = new Parser({ blankNodePrefix: '' })

  const quads = parser
    .parse(props.data)
    .map((q) => quad(q.subject, q.predicate, q.object, graphNameTerm))
  addQuads(quads)

  const shapesQuads = parser
    .parse(props.nodeShapeData)
    .map((q) => quad(q.subject, q.predicate, q.object, shapeGraphNameTerm))
  addQuads(shapesQuads)

  // Add a copy of the quads into the local store.
  // This store is used later when the user performs the "save" action
  // to get a diff on what changes were made to the shui store.
  store.addQuads(quads)
  store.addQuads(shapesQuads)
})

const onSaveClick = async () => {
  console.log(props.submissionUrl)
  const deleted_quads = Array.from(store.difference(shui.value.store)) as Quad[]
  const added_quads = Array.from(shui.value.store.difference(store)) as Quad[]
  console.log(`Deleted:\n${JSON.stringify(deleted_quads, null, 2)}`)
  console.log(`Added:\n${JSON.stringify(added_quads, null, 2)}`)

  if (deleted_quads.length || added_quads.length) {
    let patchStatements = 'TX .\n'
    for (const q of deleted_quads) {
      patchStatements += `D ${writer.quadToString(q.subject, q.predicate, q.object, q.graph)}`
    }
    for (const q of added_quads) {
      patchStatements += `A ${writer.quadToString(q.subject, q.predicate, q.object, q.graph)}`
    }
    patchStatements += 'TC .'
    isSaving.value = true

    const response = await fetch(props.submissionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/rdf-patch-body'
        // TODO: integrate csrf
        // "X-CSRFToken": props.csrf,
      },
      body: patchStatements
    })
    if (response.ok) {
      const json = await response.json()
      toast.add({ severity: 'success', summary: 'Message', detail: 'Saved.', life: 3000 })
      window.location.href = json?.['redirect']
    } else {
      const data = await response.json()
      toast.add({ severity: 'error', summary: 'Message', detail: data?.detail, life: 5000 })
    }

    isSaving.value = false

    return
  }

  toast.add({ severity: 'warn', summary: 'Message', detail: 'No changes to save.', life: 3000 })
}
</script>

<template>
  <Toast />
  <div class="space-y-4">
    <FocusNode
      :focus-node="focusNodeTerm"
      :data-graph="graphNameTerm"
      :node-shape="nodeShapeTerm"
    />
    <Button @click="onSaveClick" :loading="isSaving" label="Save" icon="pi pi-save" />
  </div>
</template>
