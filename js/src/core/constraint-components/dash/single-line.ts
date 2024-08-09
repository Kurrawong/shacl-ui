import { dash } from '@/core/namespaces'
import { ConstraintComponent } from '../constraint-component'
import type { Shape } from '@/types'
import { booleanLexicalToValue } from '@/core/lexical'

export class SingleLineConstraintComponent extends ConstraintComponent {
  _singleLine

  constructor(shape: Shape) {
    super(shape)

    const singleLineParameterValues = shape.ptr.out([dash.singleLine]).terms || []
    if (singleLineParameterValues.length < 1) {
      throw Error(
        `SingleLineConstraintComponent must have at least one dash:singleLine predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (singleLineParameterValues.length > 1) {
      throw Error(
        `SingleLineConstraintComponent must have at most one dash:singleLine predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (!shape.isPropertyShape) {
      throw Error(
        `SingleLineConstraintComponent can only be present on a PropertyShape, not a NodeShape. See shape ${shape.ptr.term.id}`
      )
    }

    this._singleLine = singleLineParameterValues[0]
  }

  get type() {
    return dash.SingleLineConstraintComponent
  }

  get singleLine() {
    return booleanLexicalToValue(this._singleLine.value)
  }
}
