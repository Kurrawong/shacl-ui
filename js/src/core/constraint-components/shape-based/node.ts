import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape } from '@/types'
import { sh } from '@/core/namespaces'
import type { Term } from 'n3'

export class NodeConstraintComponent extends ConstraintComponent {
  _nodes: Term[]

  constructor(shape: Shape) {
    super(shape)

    const nodeParameterValues = shape.ptr.out([sh.node]).terms || []
    if (nodeParameterValues.length < 1) {
      throw Error(
        `NodeConstraintComponent must have at least one sh:node predicate. See shape ${shape.ptr.term.id}`
      )
    }

    this._nodes = nodeParameterValues
  }

  get type() {
    return sh.NodeConstraintComponent
  }

  get nodes() {
    return this._nodes
  }
}
