import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape, UISchema } from '@/types'
import { sh } from '@/core/namespaces'
import type { BlankNode, NamedNode } from '@rdfjs/types'

const VALID_NODE_KIND_VALUES = [
  sh.NodeKind,
  sh.BlankNode,
  sh.IRI,
  sh.Literal,
  sh.BlankNodeOrIRI,
  sh.BlankNodeOrLiteral,
  sh.IRIOrLiteral
]

export class NodeKindConstraintComponent extends ConstraintComponent {
  _nodeKind

  constructor(shape: Shape) {
    super(shape)

    const nodeKindParameterValues = shape.ptr.out([sh.nodeKind]).terms || []
    if (nodeKindParameterValues.length < 1) {
      throw Error(
        `NodeKindConstraintComponent must have at least one sh:nodeKind predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (nodeKindParameterValues.length > 1) {
      throw Error(
        `NodeKindConstraintComponent must have at most one sh:datatype predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    const _nodeKind = nodeKindParameterValues[0]
    if (!VALID_NODE_KIND_VALUES.some((nodeKind) => nodeKind.equals(_nodeKind))) {
      throw Error(
        `NodeKindConstraintComponent must have a value from the following: ${VALID_NODE_KIND_VALUES}`
      )
    }

    this._nodeKind = _nodeKind
  }

  get type() {
    return 'NodeKindConstraintComponent'
  }

  get nodeKind() {
    return this._nodeKind
  }

  evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ) {
    const path = this.shape.path[0].predicates[0].value
    if (!(focusNode.value in schema)) {
      schema[focusNode.value] = {
        predicates: {
          [path]: {
            group: null,
            constraintComponents: [],
            values: []
          }
        }
      }
    }

    const predicates = schema[focusNode.value].predicates
    if (!(path in predicates)) {
      predicates[path] = { group: null, constraintComponents: [], values: [] }
    }
    predicates[path].constraintComponents.push(this)
  }
}