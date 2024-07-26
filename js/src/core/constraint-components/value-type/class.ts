import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape, UISchema } from '@/types'
import { sh } from '@/core/namespaces'
import type { BlankNode, NamedNode } from '@rdfjs/types'

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
    return 'ClassConstraintComponent'
  }

  get classes() {
    return this._classes
  }

  evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ) {
    this.addToUISchema(focusNode, schema)
  }
}
