import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape } from '@/types'
import { sh } from '@/core/namespaces'

export class DatatypeConstraintComponent extends ConstraintComponent {
  _datatype

  constructor(shape: Shape) {
    super(shape)

    const dataParameterValues = shape.ptr.out([sh.datatype]).terms || []
    if (dataParameterValues.length < 1) {
      throw Error(
        `DatatypeConstraintComponent must have at least one sh:datatype predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    if (dataParameterValues.length > 1) {
      throw Error(
        `DatatypeConstraintComponent must have at most one sh:datatype predicate. See property shape ${shape.ptr.term.id}`
      )
    }

    const _datatype = dataParameterValues[0]
    if (_datatype.termType !== 'NamedNode') {
      throw Error(
        `DatatypeConstraintComponent must have an IRI as the value for sh:datatype predicate, not ${_datatype.id}. See property shape ${shape.ptr.term.id}`
      )
    }

    this._datatype = _datatype
  }

  get type() {
    return sh.DatatypeConstraintComponent
  }

  get datatype() {
    return this._datatype
  }
}
