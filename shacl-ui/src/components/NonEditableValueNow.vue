<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash, sh } from '@/core/namespaces'
import { getViewerWidgets } from '@/core/widgets'
import ValueNodeMenu from '@/components/ValueNodeMenu.vue'
import FocusNode from '@/components/FocusNode.vue'
import HyperlinkViewer from '@/components/viewers/HyperlinkViewer.vue'
import LangStringViewer from '@/components/viewers/LangStringViewer.vue'
import LiteralViewer from '@/components/viewers/LiteralViewer.vue'
import URIViewer from '@/components/viewers/URIViewer.vue'

const props = defineProps<{
  path: NamedNode
  valueNode: NamedNode | BlankNode | Literal
  propertyShape?: Shape
}>()

const viewerWidgets = computed(() => {
  return getViewerWidgets(props.valueNode, props.propertyShape).filter(
    (widget) => widget.score === null || widget.score > 0,
  )
})

const selectedViewerWidget = ref(viewerWidgets.value.at(0) ?? null)

const handleChangeViewerWidget = (viewerWidget: NamedNode) => {
  selectedViewerWidget.value =
    viewerWidgets.value.find((widget) => widget.term.equals(viewerWidget)) ?? null
}
</script>

<template>
  <div class="flex items-start gap-2">
    <FocusNode
      v-if="selectedViewerWidget?.term.equals(dash.DetailsViewer)"
      :focus-node="valueNode as NamedNode"
      :node-shape="propertyShape?.shapeNodePointer.out(sh.node).term as NamedNode"
    />

    <HyperlinkViewer
      v-else-if="selectedViewerWidget?.term.equals(dash.HyperlinkViewer)"
      :term="valueNode as Literal"
    />

    <LangStringViewer
      v-else-if="selectedViewerWidget?.term.equals(dash.LangStringViewer)"
      :term="valueNode as Literal"
    />

    <LiteralViewer
      v-else-if="selectedViewerWidget?.term.equals(dash.LiteralViewer)"
      :term="valueNode as Literal"
    />

    <URIViewer
      v-else-if="selectedViewerWidget?.term.equals(dash.URIViewer)"
      :term="valueNode as NamedNode"
    />

    <div v-else class="text-sm">
      {{ valueNode.value }}

      <div class="text-xs text-gray-400">
        Widget not found ({{
          selectedViewerWidget?.term.value.split('#').at(-1)?.split('/').at(-1)
        }})
      </div>
    </div>

    <div class="flex justify-end ml-auto">
      <ValueNodeMenu
        v-if="selectedViewerWidget"
        :selected-widget="selectedViewerWidget"
        :widgets="viewerWidgets"
        @change-widget="handleChangeViewerWidget"
      />
    </div>
  </div>
</template>
