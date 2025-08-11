import { dash, rdf, sh, xsd, TRUE_LITERAL, FALSE_LITERAL, RDF, XSD } from '@/core/namespaces'
import type { WidgetsMap } from '@/core/types'
import { getSHOrDatatypes } from '@/core/utils'

// TODO: consider sh:nodeKind
export const editorWidgetsMap: WidgetsMap = new Map()

editorWidgetsMap.set(dash.AutoCompleteEditor, (valueNode) => {
  if (valueNode.termType === 'NamedNode') {
    return 1
  }

  return 0
})

editorWidgetsMap.set(dash.BooleanSelectEditor, (valueNode, propertyShape) => {
  if (valueNode.termType === 'Literal' && valueNode.datatype.equals(xsd.boolean)) {
    return 10
  }

  if (valueNode.termType !== 'Literal') {
    return 0
  }

  if (propertyShape && !propertyShape.shapeNodePointer.out(sh.datatype).term?.equals(xsd.boolean)) {
    return 0
  }

  return null
})

editorWidgetsMap.set(dash.DatePickerEditor, (valueNode, propertyShape) => {
  if (valueNode.termType === 'Literal' && valueNode.datatype.equals(xsd.date)) {
    return 10
  }

  if (propertyShape) {
    const shOrDatatypes = getSHOrDatatypes(propertyShape)
    const datatype = propertyShape.shapeNodePointer.out(sh.datatype).term
    if (datatype?.equals(xsd.date) || shOrDatatypes.has(xsd.date)) {
      return 5
    }
  }

  return 0
})

editorWidgetsMap.set(dash.DetailsEditor, (valueNode) => {
  if (valueNode.termType !== 'Literal') {
    return null
  }

  return 0
})

editorWidgetsMap.set(dash.TextAreaEditor, (valueNode, propertyShape) => {
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
      !datatype?.value.startsWith(XSD) &&
      !datatype?.value.startsWith(RDF)
    ) {
      return null
    }
  }

  return 0
})

editorWidgetsMap.set(dash.TextAreaWithLangEditor, (valueNode, propertyShape) => {
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
})

editorWidgetsMap.set(dash.TextFieldEditor, (valueNode) => {
  if (
    valueNode.termType === 'Literal' &&
    !(valueNode.datatype.equals(rdf.langString) || valueNode.datatype.equals(xsd.boolean))
  ) {
    return 10
  }

  return 0
})

editorWidgetsMap.set(dash.TextFieldWithLangEditor, (valueNode, propertyShape) => {
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
})

editorWidgetsMap.set(dash.URIEditor, (valueNode, propertyShape) => {
  if (valueNode.termType !== 'NamedNode') {
    return 0
  }

  if (
    propertyShape &&
    propertyShape.shapeNodePointer.out(sh.nodeKind).term?.equals(sh.IRI) &&
    !propertyShape.shapeNodePointer.out(sh.class).term
  ) {
    return 10
  }

  return null
})
