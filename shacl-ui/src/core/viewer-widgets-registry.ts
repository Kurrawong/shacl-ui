import { dash, rdf, xsd } from '@/core/namespaces'
import type { WidgetsMap } from '@/core/types'

export const viewerWidgetsMap: WidgetsMap = new Map()

viewerWidgetsMap.set(dash.BlankNodeViewer, (valueNode) => {
  if (valueNode.termType === 'BlankNode') {
    return 1
  }

  return 0
})

viewerWidgetsMap.set(dash.DetailsViewer, (valueNode) => {
  if (valueNode.termType === 'Literal') {
    return 0
  }

  return null
})

viewerWidgetsMap.set(dash.HyperlinkViewer, (valueNode) => {
  if (valueNode.termType === 'Literal') {
    if (valueNode.datatype.equals(xsd.anyURI)) {
      return 50
    }

    if (valueNode.datatype.equals(xsd.string)) {
      return null
    }
  }

  return 0
})

viewerWidgetsMap.set(dash.LangStringViewer, (valueNode) => {
  if (valueNode.termType === 'Literal' && valueNode.datatype.equals(rdf.langString)) {
    return 10
  }

  return 0
})

viewerWidgetsMap.set(dash.LiteralViewer, (valueNode) => {
  if (valueNode.termType === 'Literal') {
    return 1
  }

  return 0
})

viewerWidgetsMap.set(dash.URIViewer, (valueNode) => {
  if (valueNode.termType === 'NamedNode') {
    return 1
  }

  return 0
})
