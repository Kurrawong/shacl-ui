import type { Shape, UISchema } from '@/types'
import type { BlankNode, NamedNode } from '@rdfjs/types'

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
}
