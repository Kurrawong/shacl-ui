import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import { dash, rdf, sh, xsd } from '@/core/namespaces'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { DatatypeConstraintComponent } from '@/core/constraint-components/value-type/datatype'
import { NodeKindConstraintComponent } from '@/core/constraint-components/value-type/node-kind'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'
import { SingleLineConstraintComponent } from '../constraint-components/dash/single-line'

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
    dash.AutoCompleteEditor,
    (object, constraintComponents) => {
      if (object.termType === 'NamedNode') {
        return 1
      }

      return 0
    }
  ],
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
    dash.DatePickerEditor,
    (object, constraintComponents) => {
      if (object.termType === 'Literal' && object.datatype.equals(xsd.date)) {
        return 10
      }

      for (const constraintComponent of constraintComponents) {
        if (
          constraintComponent instanceof DatatypeConstraintComponent &&
          constraintComponent.datatype.equals(xsd.date)
        ) {
          return 5
        }
      }

      return 0
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
  // [
  //   dash.LiteralEditor,
  //   (object, constraintComponents) => {
  //     // We implement the rules defined in https://datashapes.org/forms.html#LiteralViewer despite this
  //     // being a Literal editor. Additionally, return 1 for any sh:nodeKind values that allow literals.
  //     if (object.termType !== 'Literal') {
  //       return 0
  //     }

  //     for (const constraintComponent of constraintComponents) {
  //       if (
  //         constraintComponent instanceof NodeKindConstraintComponent &&
  //         (constraintComponent.nodeKind.equals(sh.Literal) ||
  //           constraintComponent.nodeKind.equals(sh.BlankNodeOrLiteral) ||
  //           constraintComponent.nodeKind.equals(sh.IRIOrLiteral))
  //       ) {
  //         return 1
  //       }
  //     }

  //     return 1
  //   }
  // ],
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
          constraintComponent.singleLine
        ) {
          return 0
        } else if (
          constraintComponent instanceof SingleLineConstraintComponent &&
          !constraintComponent.singleLine &&
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
    dash.TextAreaWithLangEditor,
    (object, constraintComponents) => {
      const permissibleDatatypes = new Set<String>()

      for (const constraintComponent of constraintComponents) {
        if (constraintComponent instanceof DatatypeConstraintComponent) {
          permissibleDatatypes.add(constraintComponent.datatype.value)
        }

        if (
          constraintComponent instanceof SingleLineConstraintComponent &&
          constraintComponent.singleLine
        ) {
          return 0
        } else if (
          constraintComponent instanceof SingleLineConstraintComponent &&
          !constraintComponent.singleLine &&
          object.termType === 'Literal' &&
          object.datatype.equals(rdf.langString)
        ) {
          return 15
        }
      }

      if (object.termType === 'Literal' && object.datatype.equals(rdf.langString)) {
        return 5
      }

      for (const datatype of permissibleDatatypes) {
        if (datatype === rdf.langString.value) {
          return 5
        }
      }

      return 0
    }
  ],
  [
    dash.TextFieldEditor,
    (object, constraintComponents) => {
      if (object.termType != 'Literal') {
        return 0
      }

      if (!object.datatype.equals(rdf.langString) && !object.datatype.equals(xsd.boolean)) {
        return 10
      }

      return 0
    }
  ],
  [
    dash.TextFieldWithLangEditor,
    (object, constraintComponents) => {
      if (object.termType === 'Literal' && object.datatype.equals(rdf.langString)) {
        return 11
      }

      const permissibleDatatypes = new Set<String>()
      let singleLine: boolean | null = null
      for (const constraintComponent of constraintComponents) {
        if (constraintComponent instanceof DatatypeConstraintComponent) {
          permissibleDatatypes.add(constraintComponent.datatype.value)
        }

        if (constraintComponent instanceof SingleLineConstraintComponent) {
          singleLine = constraintComponent.singleLine
        }
      }

      if (
        singleLine === null &&
        permissibleDatatypes.has(rdf.langString.value) &&
        permissibleDatatypes.has(xsd.string.value)
      ) {
        return 11
      }

      if (singleLine) {
        for (const datatype of permissibleDatatypes) {
          if (datatype === rdf.langString.value) {
            return 5
          }
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
        // return 1
        return null
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
