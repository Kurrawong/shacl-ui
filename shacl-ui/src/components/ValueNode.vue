<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { NamedNode, BlankNode, Literal, DatasetCore } from '@rdfjs/types'
import n3 from 'n3'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { getEditorWidgets } from '@/lib/widgets'
import TextFieldEditor from '@/components/editors/TextFieldEditor.vue'
import { dash } from '@/lib/namespaces'
import TextFieldWithLangEditor from '@/components/editors/TextFieldWithLangEditor.vue'
import { Input } from '@/components/ui/input'
import ValueNodeMenu from '@/components/ValueNodeMenu.vue'

const { quad } = n3.DataFactory

const props = defineProps<{
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

const updated = ref(false)
const newValue = ref<NamedNode | BlankNode | Literal>(props.valueNode)

const editorWidgets = computed(() => {
  return getEditorWidgets(props.valueNode, props.propertyShape).filter((widget) => widget.score > 0)
})
const selectedEditorWidget = ref(
  editorWidgets.value.at(0) && editorWidgets.value.at(0)!.score > 0
    ? editorWidgets.value.at(0)
    : null,
)

// TODO: handleSave and handleDelete currently only works with property paths.

const handleSave = () => {
  if (!updated.value) {
    return
  }
  updated.value = false
  console.log(
    `${props.focusNode.value} ${props.path.value} ${props.valueNode.value} -> ${newValue.value.value}`,
  )
  deleteQuad(quad(props.focusNode, props.path, props.valueNode))
  addQuad(quad(props.focusNode, props.path, newValue.value))
}

const handleUpdate = (term: NamedNode | BlankNode | Literal) => {
  updated.value = true
  newValue.value = term
}

const handleDelete = () => {
  deleteQuad(quad(props.focusNode, props.path, props.valueNode))
}
</script>

<template>
  <div class="flex items-center gap-2">
    <TextFieldEditor
      v-if="selectedEditorWidget?.term.equals(dash.TextFieldEditor)"
      :term="valueNode as Literal"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <TextFieldWithLangEditor
      v-else-if="selectedEditorWidget?.term.equals(dash.TextFieldWithLangEditor)"
      :term="valueNode as Literal"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <Input v-else type="text" :value="valueNode.value" disabled />

    <ValueNodeMenu
      v-if="selectedEditorWidget"
      :selected-editor-widget="selectedEditorWidget"
      :editor-widgets="editorWidgets"
      @change-editor-widget="
        (editorWidget: NamedNode) =>
          (selectedEditorWidget = editorWidgets.find((widget) => widget.term.equals(editorWidget)))
      "
      @delete="handleDelete"
    />
  </div>
</template>
