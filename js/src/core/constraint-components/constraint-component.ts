import type { Shape, UISchema } from '@/types'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import { rdfs, sh } from '@/core/namespaces'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode

export const DEFAULT_SH_ORDER_VALUE = 999999

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

  /**
   * Add the property shape and its path to the UI schema, grouped by the focus node.
   *
   * @param focusNode
   * @param schema
   * @returns void
   */
  addToUISchema(focusNode: NamedNode | BlankNode, schema: UISchema): void {
    const path = this.shape.path[0].predicates[0].value
    if (!(focusNode.value in schema)) {
      schema[focusNode.value] = {
        predicates: {
          [path]: {
            order: DEFAULT_SH_ORDER_VALUE,
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
        order: DEFAULT_SH_ORDER_VALUE,
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
        order: Number.isNaN(order) ? DEFAULT_SH_ORDER_VALUE : order
      }
      predicates[path].group = groupTerm
      schema[focusNode.value].groups.set(groupTerm.id, group)
    }

    // Find and add SHACL order for the predicate.
    const order = Number(this.shape.ptr.out([sh.order]).value)
    if (!Number.isNaN(order)) {
      predicates[path].order = order
    }
  }
}
