import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape } from '@/types'
import { sh } from '@/core/namespaces'

export class ClassConstraintComponent extends ConstraintComponent {
  _classes

  constructor(shape: Shape) {
    super(shape)

    const classParameterValues = shape.ptr.out([sh.class]).terms || []
    if (classParameterValues.length < 1) {
      throw Error(
        `ClassConstraintComponent must have at least one sh:class predicate. See shape ${shape.ptr.term.id}`
      )
    }

    this._classes = classParameterValues
  }

  get type() {
    return sh.ClassConstraintComponent
  }

  get classes() {
    return this._classes
  }
}
