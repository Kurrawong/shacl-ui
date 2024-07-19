import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { dash, sh, xsd } from '@/core/namespaces'
import { DatatypeConstraintComponent } from '@/core/constraint-components/value-type/datatype'
import { NodeKindConstraintComponent } from '@/core/constraint-components/value-type/node-kind'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'

export interface Widget {
  type: NamedNode
  score: number | null
}

export type ObjectParam = NamedNode | BlankNode | Literal

export interface Widgets {
  viewers: Widget[]
  editors: Widget[]
}

function containsConstraintComponent(
  constraintComponentClass: typeof ConstraintComponent,
  constraintComponents: ConstraintComponent[]
) {
  for (const constraintComponent of constraintComponents) {
    // TODO: Add test to ensure this if statement works.
    if (constraintComponent instanceof constraintComponentClass) {
      return true
    }
  }
  return false
}

// A map of DASH widgets to their scoring function.
// Scoring logic source: https://datashapes.org/forms.html#widgets.
const editorWidgets = new Map<
  NamedNode,
  (object: ObjectParam, constraintComponents: ConstraintComponent[]) => number | null
>([
  [
    dash.BooleanSelectEditor,
    (object, constraintComponents) => {
      if (object.termType !== 'Literal') {
        return 0
      }

      for (const constraintComponent of constraintComponents) {
        if (
          constraintComponent instanceof DatatypeConstraintComponent &&
          !constraintComponent.datatype.equals(xsd.boolean)
        ) {
          return 0
        }
      }

      if (object.datatype.equals(xsd.boolean)) {
        return 10
      }

      return null
    }
  ],
  [
    dash.DetailsEditor,
    (object, constraintComponents) => {
      // TODO: Handle dash:editor constraint component.
      // TODO: DetailsEditor needs to be able to fetch
      //    and expand the graph the data about the new focus node remotely.

      if (object.termType !== 'Literal') {
        return null
      }

      return 0
    }
  ],
  [
    dash.LiteralEditor,
    (object, constraintComponents) => {
      // We implement the rules defined in https://datashapes.org/forms.html#LiteralViewer despite this
      // being a Literal editor. Additionally, return 1 for any sh:nodeKind values that allow literals.
      if (object.termType !== 'Literal') {
        return 0
      }

      for (const constraintComponent of constraintComponents) {
        if (
          constraintComponent instanceof NodeKindConstraintComponent &&
          (constraintComponent.nodeKind.equals(sh.Literal) ||
            constraintComponent.nodeKind.equals(sh.BlankNodeOrLiteral) ||
            constraintComponent.nodeKind.equals(sh.IRIOrLiteral))
        ) {
          return 1
        }
      }

      return 1
    }
  ],
  [
    dash.URIEditor,
    (object, constraintComponents) => {
      function containsNodeKindIRI(constraintComponents: ConstraintComponent[]) {
        for (const constraintComponent of constraintComponents) {
          if (
            constraintComponent instanceof NodeKindConstraintComponent &&
            constraintComponent.nodeKind.equals(sh.IRI)
          ) {
            return true
          }
        }
        return false
      }

      if (
        object.termType === 'NamedNode' &&
        containsNodeKindIRI(constraintComponents) &&
        !containsConstraintComponent(ClassConstraintComponent, constraintComponents)
      ) {
        return 10
      }

      if (object.termType === 'NamedNode') {
        // TODO: dash spec says null, but we've changed it to 1 for testing
        // to compete with details editor
        return 1
        // return null
      }

      return 0
    }
  ]
])

export function getWidgets(object: ObjectParam, constraintComponents: ConstraintComponent[]) {
  const widgets: Widgets = { viewers: [], editors: [] }

  editorWidgets.forEach((value, key) =>
    widgets.editors.push({
      type: key,
      score: value(object, constraintComponents)
    })
  )

  return widgets
}
