import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { shx } from '@/core/namespaces'
import type { Shape } from '@/types'

export class TargetGraphConstraintComponent extends ConstraintComponent {
  _targetGraphs

  constructor(shape: Shape) {
    super(shape)

    const targetGraphParameterValues = shape.ptr.out([shx.targetGraph]).terms || []
    if (targetGraphParameterValues.length < 1) {
      throw Error(
        `TargetGraphConstraintComponent must have at least one shx:targetGraph predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (targetGraphParameterValues.length > 1) {
      throw Error(
        `TargetGraphConstraintComponent must have at most one shx:targetGraph predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    this._targetGraphs = targetGraphParameterValues
  }

  get type() {
    return shx.TargetGraphConstraintComponent
  }

  get targetGraphs() {
    return this._targetGraphs
  }
}
