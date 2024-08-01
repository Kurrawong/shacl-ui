import type { NamedNode, BlankNode } from '@rdfjs/types'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import type { Shape, UISchema } from '@/types'
import { sh } from '@/core/namespaces'
import { visitShape } from '@/core/constraint-components/shape-visitor'

export class PropertyConstraintComponent extends ConstraintComponent {
  _properties

  constructor(shape: Shape) {
    super(shape)

    const propertyParameterValues = shape.ptr.out([sh.property]).terms || []
    if (propertyParameterValues.length < 1) {
      throw Error(
        `PropertyConstraintComponent must have at least one sh:property predicate. See shape ${shape.ptr.term.id}`
      )
    }

    this._properties = []
    for (const p of propertyParameterValues) {
      if (p.termType === 'NamedNode' || p.termType === 'BlankNode') {
        this._properties.push(p)
      }
    }
  }

  get type(): string {
    return 'PropertyConstraintComponent'
  }

  get properties() {
    return this._properties
  }

  evaluateUserInterface(
    focusNode: NamedNode | BlankNode,
    shapesGraphName: NamedNode | BlankNode,
    schema: UISchema
  ): void {
    for (const propertyParameterValue of this.properties) {
      const ptr = this.shape.ptr.node([propertyParameterValue])
      const shape = this.shape.validator.shape(ptr)
      visitShape(focusNode, shape, shapesGraphName, schema)
    }
  }
}
