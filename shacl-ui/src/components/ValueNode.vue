<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import n3 from 'n3'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { getEditorWidgets } from '@/core/widgets'
import TextFieldEditor from '@/components/editors/TextFieldEditor.vue'
import { dash } from '@/core/namespaces'
import TextFieldWithLangEditor from '@/components/editors/TextFieldWithLangEditor.vue'
import { Input } from '@/components/ui/input'
import URIEditor from '@/components/editors/URIEditor.vue'
import ValueNodeMenu from '@/components/ValueNodeMenu.vue'
import BooleanSelectEditor from '@/components/editors/BooleanSelectEditor.vue'
import TextAreaEditor from '@/components/editors/TextAreaEditor.vue'
import TextAreaWithLangEditor from '@/components/editors/TextAreaWithLangEditor.vue'
import DatePickerEditor from '@/components/editors/DatePickerEditor.vue'
import { sh } from '@/core/namespaces'
import FocusNode from './FocusNode.vue'
import { useFocusNodeContext } from '@/composables/focus-node'
import { useResourceManagerContext } from '@/composables/resource-manager'

const { quad } = n3.DataFactory

const props = withDefaults(
  defineProps<{
    path: NamedNode
    valueNode: NamedNode | BlankNode | Literal
    propertyShape?: Shape
    inverse?: boolean
  }>(),
  {
    inverse: false,
  },
)

const { focusNode } = useFocusNodeContext()
const { addQuad, deleteQuad } = useResourceManagerContext()

const updated = ref(false)
const newValue = ref<NamedNode | BlankNode | Literal>(props.valueNode)

const editorWidgets = computed(() => {
  return getEditorWidgets(props.valueNode, props.propertyShape).filter(
    (widget) => widget.score === null || widget.score > 0,
  )
})
// TODO: set editor widget if dash:editor exists on property shape.
const selectedEditorWidget = ref(editorWidgets.value.at(0) ?? null)

// TODO: handleSave and handleDelete currently only works with property paths.

const handleSave = () => {
  if (!updated.value) {
    return
  }
  updated.value = false

  if (props.inverse) {
    deleteQuad(quad(props.valueNode as NamedNode, props.path, focusNode.value))
    addQuad(quad(newValue.value as NamedNode, props.path, focusNode.value))
    console.log(
      `${props.valueNode.value} ${props.path.value} ${focusNode.value} -> ${newValue.value.value}`,
    )
  } else {
    deleteQuad(quad(focusNode.value, props.path, props.valueNode))
    addQuad(quad(focusNode.value, props.path, newValue.value))
    console.log(
      `${focusNode.value} ${props.path.value} ${props.valueNode.value} -> ${newValue.value.value}`,
    )
  }
}

const handleUpdate = (term: NamedNode | BlankNode | Literal) => {
  updated.value = true
  newValue.value = term
}

const handleDelete = () => {
  deleteQuad(quad(focusNode.value, props.path, props.valueNode))
}

const handleChangeEditorWidget = (editorWidget: NamedNode) => {
  selectedEditorWidget.value =
    editorWidgets.value.find((widget) => widget.term.equals(editorWidget)) ?? null
}
</script>

<template>
  <div class="flex items-start gap-2">
    <BooleanSelectEditor
      v-if="selectedEditorWidget?.term.equals(dash.BooleanSelectEditor)"
      :term="valueNode as Literal"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <DatePickerEditor
      v-else-if="selectedEditorWidget?.term.equals(dash.DatePickerEditor)"
      :term="valueNode as Literal"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <FocusNode
      v-else-if="selectedEditorWidget?.term.equals(dash.DetailsEditor)"
      :focus-node="valueNode as NamedNode"
      :node-shape="propertyShape?.shapeNodePointer.out(sh.node).term as NamedNode"
    />

    <TextAreaEditor
      v-else-if="selectedEditorWidget?.term.equals(dash.TextAreaEditor)"
      :term="valueNode as Literal"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <TextAreaWithLangEditor
      v-else-if="selectedEditorWidget?.term.equals(dash.TextAreaWithLangEditor)"
      :term="valueNode as Literal"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <TextFieldEditor
      v-else-if="selectedEditorWidget?.term.equals(dash.TextFieldEditor)"
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

    <URIEditor
      v-else-if="selectedEditorWidget?.term.equals(dash.URIEditor)"
      :term="valueNode as NamedNode"
      @update="handleUpdate"
      @blur="handleSave"
    />

    <div v-else class="grow">
      <Input :default-value="valueNode.value" disabled />
      <span v-if="selectedEditorWidget" class="text-xs text-gray-500 italic"
        >No widget found for {{ selectedEditorWidget?.term.value }}</span
      >
      <span v-else class="text-xs text-gray-500 italic">No widget found</span>
    </div>

    <div class="flex justify-end ml-auto">
      <ValueNodeMenu
        v-if="selectedEditorWidget"
        :selected-editor-widget="selectedEditorWidget"
        :editor-widgets="editorWidgets"
        @change-editor-widget="handleChangeEditorWidget"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
