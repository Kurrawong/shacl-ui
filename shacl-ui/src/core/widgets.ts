import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import type { Widget, WidgetsMap } from '@/core/types'
import { editorWidgetsMap } from '@/core/editor-widgets-registry'

function widgetSort(a: Widget, b: Widget) {
  if (a.score === null && b.score === null) return 0
  if (a.score === null) return 1
  if (b.score === null) return -1
  return b.score - a.score
}

function getWidgets(
  widgetsMap: WidgetsMap,
  valueNode: NamedNode | BlankNode | Literal,
  propertyShape?: Shape,
) {
  const widgets: Widget[] = []

  widgetsMap.forEach((widgetFactory, term) => {
    const widget = widgetFactory(valueNode, propertyShape)
    widgets.push({
      term,
      score: widget,
    })
  })

  return widgets.sort(widgetSort)
}

export function getEditorWidgets(
  valueNode: NamedNode | BlankNode | Literal,
  propertyShape?: Shape,
) {
  return getWidgets(editorWidgetsMap, valueNode, propertyShape)
}

export function getViewerWidgets(
  valueNode: NamedNode | BlankNode | Literal,
  propertyShape?: Shape,
) {}
