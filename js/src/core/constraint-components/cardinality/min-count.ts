import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape, UISchema } from '@/types'
import { sh, xsd } from '@/core/namespaces'
import type { BlankNode, NamedNode } from '@rdfjs/types'

export class MinCountConstraintComponent extends ConstraintComponent {
  _minCount

  constructor(shape: Shape) {
    super(shape)

    const minCountParameterValues = shape.ptr.out([sh.minCount]).terms || []
    if (minCountParameterValues.length < 1) {
      throw Error(
        `MinCountConstraintComponent must have at least one sh:minCount predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (minCountParameterValues.length > 1) {
      throw Error(
        `MinCountConstraintComponent must have at most one sh:minCount predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (!shape.isPropertyShape) {
      throw Error(
        `MinCountConstraintComponent can only be present on a PropertyShape, not a NodeShape. See property shape ${shape.ptr.term.id}`
      )
    }

    const minCount = minCountParameterValues[0]

    if (
      minCount.termType !== 'Literal' ||
      (minCount.termType === 'Literal' && !minCount.datatype.equals(xsd.integer))
    ) {
      throw Error(
        `MinCountConstraintComponent sh:minCount must be a literal with datatype xsd:integer. See property shape ${shape.ptr.term.id}`
      )
    }

    if (Number(minCount.value) < 0) {
      throw Error(
        `MinCountConstraintComponent sh:minCount must be an integer >= 0. See property shape ${shape.ptr.term.id}`
      )
    }

    this._minCount = minCount
  }

  get type() {
    return sh.MinCountConstraintComponent
  }

  get minCount() {
    return this._minCount
  }

  evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ) {
    this.addToUISchema(focusNode, schema)
  }
}
