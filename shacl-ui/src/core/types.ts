import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'

export type Widget = {
  term: NamedNode
  score: number | null
}

export type WidgetsMap = Map<
  NamedNode,
  (valueNode: NamedNode | BlankNode | Literal, propertyShape?: Shape) => number | null
>
