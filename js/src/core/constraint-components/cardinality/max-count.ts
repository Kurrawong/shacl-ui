import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape, UISchema } from '@/types'
import { sh, xsd } from '@/core/namespaces'
import type { BlankNode, NamedNode } from '@rdfjs/types'

export class MaxCountConstraintComponent extends ConstraintComponent {
  _maxCount

  constructor(shape: Shape) {
    super(shape)

    const maxCountParameterValues = shape.ptr.out([sh.maxCount]).terms || []
    if (maxCountParameterValues.length < 1) {
      throw Error(
        `MaxCountConstraintComponent must have at least one sh:maxCount predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (maxCountParameterValues.length > 1) {
      throw Error(
        `MaxCountConstraintComponent must have at most one sh:maxCount predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (!shape.isPropertyShape) {
      throw Error(
        `MaxCountConstraintComponent can only be present on a PropertyShape, not a NodeShape. See property shape ${shape.ptr.term.id}`
      )
    }

    const maxCount = maxCountParameterValues[0]

    if (
      maxCount.termType !== 'Literal' ||
      (maxCount.termType === 'Literal' && !maxCount.datatype.equals(xsd.integer))
    ) {
      throw Error(
        `MaxCountConstraintComponent sh:maxCount must be a literal with datatype xsd:integer. See property shape ${shape.ptr.term.id}`
      )
    }

    if (Number(maxCount.value) < 0) {
      throw Error(
        `MaxCountConstraintComponent sh:maxCount must be an integer >= 0. See property shape ${shape.ptr.term.id}`
      )
    }

    this._maxCount = maxCount
  }

  get type() {
    return sh.MaxCountConstraintComponent
  }

  get maxCount() {
    return this._maxCount
  }

  evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ) {
    this.addToUISchema(focusNode, schema)
  }
}
