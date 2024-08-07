import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import { dash, rdf, sh, xsd } from '@/core/namespaces'
import type { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { DatatypeConstraintComponent } from '@/core/constraint-components/value-type/datatype'
import { NodeKindConstraintComponent } from '@/core/constraint-components/value-type/node-kind'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'
import { SingleLineConstraintComponent } from '../constraint-components/dash/single-line'
import { booleanLexicalToValue } from '../lexical'

const _RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const _XSD = 'http://www.w3.org/2001/XMLSchema#'

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
    // TODO: Add test to ensure this if-statement works.
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
    dash.BlankNodeEditor,
    (object, constraintComponents) => {
      if (object.termType === 'BlankNode') {
        return 1
      }
      return 0
    }
  ],
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
    dash.TextAreaEditor,
    (object, constraintComponents) => {
      const permissibleDatatypes = new Set<String>()

      for (const constraintComponent of constraintComponents) {
        if (constraintComponent instanceof DatatypeConstraintComponent) {
          permissibleDatatypes.add(constraintComponent.datatype.value)
        }

        if (
          constraintComponent instanceof SingleLineConstraintComponent &&
          booleanLexicalToValue(constraintComponent.singleLine.value)
        ) {
          return 0
        } else if (
          constraintComponent instanceof SingleLineConstraintComponent &&
          !booleanLexicalToValue(constraintComponent.singleLine.value) &&
          object.termType === 'Literal' &&
          object.datatype.equals(xsd.string)
        ) {
          return 20
        }
      }

      if (object.termType === 'Literal' && object.datatype.equals(xsd.string)) {
        return 5
      }

      if (permissibleDatatypes.has(xsd.string.value)) {
        return 2
      }

      for (const datatype of permissibleDatatypes) {
        if (!datatype.startsWith(_RDF) && !datatype.startsWith(_XSD)) {
          return null
        }
      }

      return 0
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

const sortFunction = (a: Widget, b: Widget) => {
  if (a.score === null && b.score === null) {
    return 0
  }
  if (a.score === null) {
    return 1
  }
  if (b.score === null) {
    return -1
  }
  return b.score - a.score
}

export function getWidgets(object: ObjectParam, constraintComponents: ConstraintComponent[]) {
  const widgets: Widgets = { viewers: [], editors: [] }

  editorWidgets.forEach((value, key) =>
    widgets.editors.push({
      type: key,
      score: value(object, constraintComponents)
    })
  )

  widgets.viewers = widgets.viewers.filter((widget) => widget.score !== 0).sort(sortFunction)
  widgets.editors = widgets.editors.filter((widget) => widget.score !== 0).sort(sortFunction)

  return widgets
}
