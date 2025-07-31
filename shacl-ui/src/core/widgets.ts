import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import n3 from 'n3'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { dash, rdf, sh, xsd } from '@/core/namespaces'
import TermSet from '@rdfjs/term-set'

const { literal } = n3.DataFactory

const TRUE_LITERAL = literal('true', xsd.boolean)
const FALSE_LITERAL = literal('false', xsd.boolean)
const _RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const _XSD = 'http://www.w3.org/2001/XMLSchema#'

export type EditorWidget = {
  term: NamedNode
  score: number | null
}

export function getSHOrDatatypes(propertyShape: Shape) {
  return new TermSet<NamedNode>(
    Array.from(propertyShape.shapeNodePointer.out(sh.or).list() || [])
      .map((pointer) => pointer.out(sh.datatype).term)
      .filter((term) => term !== undefined && term.termType === 'NamedNode'),
  )
}

// TODO: consider sh:nodeKind
const editorWidgetsMap = new Map<
  NamedNode,
  (valueNode: NamedNode | BlankNode | Literal, propertyShape?: Shape) => number | null
>([
  [
    dash.BooleanSelectEditor,
    (valueNode, propertyShape) => {
      if (valueNode.termType === 'Literal' && valueNode.datatype.equals(xsd.boolean)) {
        return 10
      }

      if (valueNode.termType !== 'Literal') {
        return 0
      }

      if (
        propertyShape &&
        !propertyShape.shapeNodePointer.out(sh.datatype).term?.equals(xsd.boolean)
      ) {
        return 0
      }

      return null
    },
  ],
  [
    dash.TextAreaEditor,
    (valueNode, propertyShape) => {
      if (propertyShape) {
        const singleLine = propertyShape.shapeNodePointer.out(dash.singleLine).term
        if (singleLine?.equals(TRUE_LITERAL)) {
          return 0
        } else if (
          singleLine?.equals(FALSE_LITERAL) &&
          valueNode.termType === 'Literal' &&
          valueNode.datatype.equals(xsd.string)
        ) {
          return 20
        }
      }

      if (valueNode.termType === 'Literal' && valueNode.datatype.equals(xsd.string)) {
        return 5
      }

      if (propertyShape) {
        const shOrDatatypes = getSHOrDatatypes(propertyShape)
        const datatype = propertyShape.shapeNodePointer.out(sh.datatype).term
        if (datatype?.equals(xsd.string) || shOrDatatypes.has(xsd.string)) {
          return 2
        }

        if (
          datatype !== undefined &&
          !datatype?.value.startsWith(_XSD) &&
          !datatype?.value.startsWith(_RDF)
        ) {
          return null
        }
      }

      return 0
    },
  ],
  [
    dash.TextAreaWithLangEditor,
    (valueNode, propertyShape) => {
      if (propertyShape) {
        const singleLine = propertyShape.shapeNodePointer.out(dash.singleLine).term
        if (singleLine?.equals(TRUE_LITERAL)) {
          return 0
        }

        if (
          valueNode.termType === 'Literal' &&
          valueNode.datatype.equals(rdf.langString) &&
          singleLine?.equals(FALSE_LITERAL)
        ) {
          return 15
        }
      }

      if (valueNode.termType === 'Literal' && valueNode.datatype.equals(rdf.langString)) {
        return 5
      }

      if (propertyShape) {
        const shOrDatatypes = getSHOrDatatypes(propertyShape)
        const datatype = propertyShape.shapeNodePointer.out(sh.datatype).term
        if (datatype?.equals(xsd.string) || shOrDatatypes.has(xsd.string)) {
          return 5
        }
      }

      return 0
    },
  ],
  [
    dash.TextFieldEditor,
    (valueNode) => {
      if (
        valueNode.termType === 'Literal' &&
        !(valueNode.datatype.equals(rdf.langString) || valueNode.datatype.equals(xsd.boolean))
      ) {
        return 10
      }

      return 0
    },
  ],
  [
    dash.TextFieldWithLangEditor,
    (valueNode, propertyShape) => {
      if (valueNode.termType === 'Literal' && valueNode.datatype.equals(rdf.langString)) {
        return 11
      }

      if (propertyShape) {
        const shOrDatatypes = getSHOrDatatypes(propertyShape)
        if (shOrDatatypes.has(rdf.langString) && shOrDatatypes.has(xsd.string)) {
          return 11
        }

        if (
          propertyShape.shapeNodePointer.out(dash.singleLine).term?.equals(FALSE_LITERAL) &&
          propertyShape.shapeNodePointer.out(sh.datatype).term?.equals(rdf.langString)
        ) {
          return 5
        }
      }

      return 0
    },
  ],
  [
    dash.URIEditor,
    (valueNode, propertyShape) => {
      if (valueNode.termType !== 'NamedNode') {
        return 0
      }

      if (
        propertyShape &&
        propertyShape.shapeNodePointer.out(sh.nodeKind).term?.equals(sh.IRI) &&
        !propertyShape.shapeNodePointer.has(sh.class)
      ) {
        return 10
      }

      return null
    },
  ],
])

export const getEditorWidgets = (
  valueNode: NamedNode | BlankNode | Literal,
  propertyShape?: Shape,
) => {
  const _editorWidgets: EditorWidget[] = []

  editorWidgetsMap.forEach((editorWidgetFactory, term) => {
    const widget = editorWidgetFactory(valueNode, propertyShape)
    _editorWidgets.push({
      term,
      score: widget,
    })
  })

  return _editorWidgets.sort((a, b) => {
    if (a.score === null && b.score === null) return 0
    if (a.score === null) return 1
    if (b.score === null) return -1

    return b.score - a.score
  })
}
