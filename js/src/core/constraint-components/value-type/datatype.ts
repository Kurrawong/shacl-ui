import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape, UISchema } from '@/types'
import { sh } from '@/core/namespaces'
import type { BlankNode, NamedNode } from '@rdfjs/types'

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
    return 'DatatypeConstraintComponent'
  }

  get datatype() {
    return this._datatype
  }

  evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ) {
    const path = this.shape.path[0].predicates[0].value
    if (!(focusNode.value in schema)) {
      schema[focusNode.value] = {
        predicates: {
          [path]: {
            group: null,
            constraintComponents: [],
            values: []
          }
        }
      }
    }

    const predicates = schema[focusNode.value].predicates
    if (!(path in predicates)) {
      predicates[path] = { group: null, constraintComponents: [], values: [] }
    }
    predicates[path].constraintComponents.push(this)
  }
}
