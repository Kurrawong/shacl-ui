import type { SBlankNode, SLiteral, SNamedNode } from '@/shui'
import type { BlankNode, NamedNode, Quad, Term } from 'n3'
import type { DataFactory } from '@rdfjs/types/data-model'
import type { DatasetCore, NamedNode as RDFJSNamedNode, Term as RDFJSTerm } from '@rdfjs/types'
import type { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Widgets } from '@/core/widgets/score-widget'

export type STerm = SNamedNode | SBlankNode | SLiteral

export type SIdentifiedNode = SNamedNode | SBlankNode

export type DropdownOption = {
  name: string
  nameTerm: Term
  code: string
  codeTerm: SNamedNode | SBlankNode
}

export interface Edge {
  dataset: DatasetCore
  end: string
  quad: Quad
  start: string
  graph: NamedNode | BlankNode
  startTerm: NamedNode | BlankNode
  term: Term
}

export interface Path {
  dataset: DatasetCore
  edges: Edge[]
  factory: DataFactory
  edge: Edge
  graph: NamedNode | BlankNode
  startTerm: Term
  value: string
  out: (predicates?: Array<RDFJSNamedNode | null>, objects?: Array<Term | null>) => Path[]
  node: (predicates: Array<RDFJSNamedNode | BlankNode>) => Path
}

export interface PathList {
  factory: DataFactory
  ptrs?: Path[]
  dataset: DatasetCore
  datasets: DatasetCore[]
  term: Term
  terms?: Term[]
  value: string
  values: string[]
  out: (predicates?: Array<RDFJSNamedNode | null>, objects?: Array<Term | null>) => PathList
  node: (predicates: Array<RDFJSNamedNode | BlankNode>) => PathList
  [Symbol.iterator](): IterableIterator<PathList>
}

export interface Registry {
  validations: Map<string, { term: NamedNode }>
}

export interface Validator {
  factory: DataFactory
  options: object
  registry: Registry
  shapes: Map<string, Shape>
  shapesPtr: PathList
  shape: (ptr: Path | PathList) => Shape
}

export interface ShapeValidator {
  shape: Shape
  //compiled
}

export interface TargetResolver {
  targetClass: Map<string, NamedNode>
  targetNode: NamedNode[]
  targetObjectsOf: NamedNode[]
  targetSubjectsOf: NamedNode[]
}

export interface Shape {
  ptr: PathList
  validator: Validator
  deactivated?: boolean
  isPropertyShape: boolean
  isSparqlShape: boolean
  //message
  path: {
    end: string
    predicates: NamedNode[]
    quantifier: string
    start: string
  }[]
  shapeValidator: ShapeValidator
  targetResolver: TargetResolver
}

export interface Group {
  term: NamedNode | BlankNode
  name: string
  order: number
}

export type PropertyGroupsMap = Map<string, Group>

export interface PredicatesShapesMapValues {
  predicate: SNamedNode
  shapes: Shape[]
  group: NamedNode | BlankNode | null
  terms: STerm[]
}

export type PredicatesShapesMap = Map<string, PredicatesShapesMapValues>

export interface PredicateConstraints {
  group: string | null
  constraintComponents: ConstraintComponent[]
  values: {
    widgets: Widgets
    term: RDFJSTerm
  }[]
}

export interface UISchemaValues {
  predicates: {
    [key: string]: PredicateConstraints
  }
}

export interface UISchema {
  [key: string]: UISchemaValues
}
