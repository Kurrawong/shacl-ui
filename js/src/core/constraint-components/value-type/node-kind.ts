import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape } from '@/types'
import { sh } from '@/core/namespaces'

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
    return sh.NodeKindConstraintComponent
  }

  get nodeKind() {
    return this._nodeKind
  }
}
