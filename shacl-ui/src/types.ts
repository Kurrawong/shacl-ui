import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'

type UIPredicate = {
  value: string
  order: number | null
}

export interface PropertyGroup {
  term: NamedNode | BlankNode
  order: number | null
  labels: Literal[]
  propertyPaths: UIPredicate[]
}

export interface UITree {
  focusNode: NamedNode | BlankNode | Literal
  nodeShape: NamedNode | BlankNode | null
  propertyGroups: PropertyGroup[]
  label: string | null
  propertyPaths: {
    [key: string]: {
      term: NamedNode
      propertyShapes: (NamedNode | BlankNode)[]
      order: number | null
      labels: Literal[]
      propertyGroups: (NamedNode | BlankNode)[]
    }
  }
}
