import type { Shape, UISchema } from '@/types'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import { rdfs, sh } from '@/core/namespaces'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode

const DEFAULT_PROPERTY_GROUP_ORDER = 9999

export abstract class ConstraintComponent {
  _shape

  protected constructor(shape: Shape) {
    this._shape = shape
  }

  get shape() {
    return this._shape
  }

  abstract get type(): string

  abstract evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ): void

  addToUISchema(focusNode: NamedNode | BlankNode, schema: UISchema) {
    const path = this.shape.path[0].predicates[0].value
    if (!(focusNode.value in schema)) {
      schema[focusNode.value] = {
        predicates: {
          [path]: {
            term: namedNode(path),
            group: null,
            constraintComponents: [],
            values: []
          }
        },
        groups: new Map()
      }
    }

    const predicates = schema[focusNode.value].predicates
    if (!(path in predicates)) {
      predicates[path] = {
        term: namedNode(path),
        group: null,
        constraintComponents: [],
        values: []
      }
    }
    predicates[path].constraintComponents.push(this)

    // Find and add SHACL property groups.
    const groups = this.shape.ptr.out([sh.group]).terms || []
    if (!groups.length) {
      return
    }
    // TODO: Are multiple groups valid for a predicate?
    const groupTerm = groups[0]
    if (groupTerm.termType === 'NamedNode' || groupTerm.termType === 'BlankNode') {
      const order = Number(this.shape.ptr.node([groupTerm]).out([sh.order]).value)
      const group = {
        term: groupTerm,
        name: this.shape.ptr.node([groupTerm]).out([rdfs.label]).value || groupTerm.value,
        order: Number.isNaN(order) ? DEFAULT_PROPERTY_GROUP_ORDER : order
      }
      predicates[path].group = groupTerm
      schema[focusNode.value].groups.set(groupTerm.id, group)
    }
  }
}
