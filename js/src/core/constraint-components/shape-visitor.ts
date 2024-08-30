import type { BlankNode, NamedNode } from '@rdfjs/types'
import type { Shape, UISchema } from '@/types'
import { dash, sh } from '@/core/namespaces'
import { DatatypeConstraintComponent } from '@/core/constraint-components/value-type/datatype'
import { NodeKindConstraintComponent } from '@/core/constraint-components/value-type/node-kind'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { PropertyConstraintComponent } from '@/core/constraint-components/shape-based/property'
import { MinCountConstraintComponent } from '@/core/constraint-components/cardinality/min-count'
import { MaxCountConstraintComponent } from '@/core/constraint-components/cardinality/max-count'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'
import { NodeConstraintComponent } from '@/core/constraint-components/shape-based/node'
import { SingleLineConstraintComponent } from './dash/single-line'

const parameterConstraintComponentMap = new Map<
  string,
  (shape: Shape) => ConstraintComponent | null
>([
  [dash.singleLine.value, (shape) => new SingleLineConstraintComponent(shape)],
  [sh.class.value, (shape) => new ClassConstraintComponent(shape)],
  [sh.datatype.value, (shape) => new DatatypeConstraintComponent(shape)],
  [sh.property.value, (shape) => new PropertyConstraintComponent(shape)],
  [sh.maxCount.value, (shape) => new MaxCountConstraintComponent(shape)],
  [sh.minCount.value, (shape) => new MinCountConstraintComponent(shape)],
  [sh.node.value, (shape) => new NodeConstraintComponent(shape)],
  [sh.nodeKind.value, (shape) => new NodeKindConstraintComponent(shape)]
])

export function visitShape(
  focusNode: NamedNode | BlankNode,
  shape: Shape,
  shapesGraphName: NamedNode | BlankNode,
  schema: UISchema
) {
  const doneConstraints = new Set()
  for (const { predicate: parameter } of shape.ptr.dataset.match(
    shape.ptr.term,
    null,
    null,
    shapesGraphName
  )) {
    const constraintComponentFunction = parameterConstraintComponentMap.get(parameter.value)
    if (constraintComponentFunction) {
      const constraintComponent = constraintComponentFunction(shape)
      if (constraintComponent !== null && !doneConstraints.has(constraintComponent.type.value)) {
        constraintComponent.evaluateUserInterface(focusNode, shapesGraphName, schema)
        doneConstraints.add(constraintComponent.type.value)
      }
    }
  }
}
