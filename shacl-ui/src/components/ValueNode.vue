<script setup lang="ts">
import { computed, inject } from 'vue'
import type { NamedNode, BlankNode, Literal, DatasetCore } from '@rdfjs/types'
import n3 from 'n3'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { getEditorWidgets } from '@/lib/widgets'
import TextFieldEditor from '@/components/editors/TextFieldEditor.vue'
import { dash } from '@/lib/namespaces'

const { quad } = n3.DataFactory

const { focusNode, path, valueNode, propertyShape } = defineProps<{
  focusNode: NamedNode | BlankNode
  path: NamedNode
  valueNode: NamedNode | BlankNode | Literal
  dataGraph: DatasetCore
  validator: UISHACLValidator
  propertyShape?: Shape
}>()

const { addQuad, deleteQuad } = inject<{
  addQuad: (quad: n3.Quad) => void
  deleteQuad: (quad: n3.Quad) => void
}>('DataStoreActions')!

const editorWidgets = computed(() => {
  return getEditorWidgets(valueNode, propertyShape)
})

const primaryEditorWidget = computed(() => {
  return editorWidgets.value.at(0)!
})

const handleUpdate = (term: NamedNode | BlankNode | Literal) => {
  console.log(`${valueNode.value} -> ${term.value}`)
  deleteQuad(quad(focusNode, path, valueNode))
  addQuad(quad(focusNode, path, term))
}
</script>

<template>
  <TextFieldEditor
    v-if="primaryEditorWidget.term.equals(dash.TextFieldEditor)"
    :term="valueNode as Literal"
    @update="handleUpdate"
  />

  <template v-else>
    {{ valueNode.value }}
  </template>
</template>
