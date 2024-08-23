import { expect, test } from '@jest/globals'
import { Shui } from '@/shui'
import { dash, skos } from '@/core/namespaces'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode

test('Expect 3 concepts', async () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX : <https://example.com/>
    PREFIX shape: <https://example.com/shapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    <urn:graph:data> {
        :concept-scheme a skos:ConceptScheme ;
            skos:hasTopConcept :concept-1 ;
        .
        
        :concept-1 a skos:Concept ;
            skos:prefLabel "Concept 1" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-2 a skos:Concept ;
            skos:prefLabel "Concept 2" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-3 a skos:Concept ;
            skos:prefLabel "Concept 3" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-4 a skos:Concept ;
            skos:prefLabel "Concept 4" ;
            skos:inScheme :another-concept-scheme ;
        .
    }
    
    <urn:system:graph:shacl> {
        shape:ConceptScheme a sh:NodeShape ;
            sh:targetClass skos:ConceptScheme ;
            sh:property [
                sh:name "Top Concepts" ;
                sh:path skos:hasTopConcept ;
                sh:class skos:Concept ;
                sh:node [
                    sh:property [
                        sh:path skos:inScheme ;
                        sh:hasValue :concept-scheme ;
                    ] ;
                ] ;
            ] ;
        .
    }
  `)
  const conceptSchemeNode = namedNode('https://example.com/concept-scheme')
  const dataGraphNode = namedNode('urn:graph:data')
  const nodeShapeNode = namedNode('https://example.com/shapes/ConceptScheme')
  const schema = await shui.getSchema(conceptSchemeNode, dataGraphNode, nodeShapeNode)

  const hasTopConceptPredicate =
    schema[conceptSchemeNode.value].predicates[skos.hasTopConcept.value]
  const values = hasTopConceptPredicate.values
  expect(values.length).toBe(1)

  const editors = values[0].widgets.editors
  expect(editors.length).toBeGreaterThanOrEqual(3)

  let dashAutoCompleteEditorWidget = null
  for (const editor of editors) {
    if (editor.type.equals(dash.AutoCompleteEditor)) {
      dashAutoCompleteEditorWidget = editor
    }
  }

  expect(dashAutoCompleteEditorWidget).toBeTruthy()

  const autocompleteResults = await shui.getAutoCompleteEditorValues(
    hasTopConceptPredicate.constraintComponents,
    dataGraphNode
  )
  expect(autocompleteResults.length).toBe(3)
})

test('Expect 2 concepts due to no skos:Concept declaration for concept-2', async () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX : <https://example.com/>
    PREFIX shape: <https://example.com/shapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    <urn:graph:data> {
        :concept-scheme a skos:ConceptScheme ;
            skos:hasTopConcept :concept-1 ;
        .
        
        :concept-1 a skos:Concept ;
            skos:prefLabel "Concept 1" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-2
            skos:prefLabel "Concept 2" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-3 a skos:Concept ;
            skos:prefLabel "Concept 3" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-4 a skos:Concept ;
            skos:prefLabel "Concept 4" ;
            skos:inScheme :another-concept-scheme ;
        .
    }
    
    <urn:system:graph:shacl> {
        shape:ConceptScheme a sh:NodeShape ;
            sh:targetClass skos:ConceptScheme ;
            sh:property [
                sh:name "Top Concepts" ;
                sh:path skos:hasTopConcept ;
                sh:class skos:Concept ;
                sh:node [
                    sh:property [
                        sh:path skos:inScheme ;
                        sh:hasValue :concept-scheme ;
                    ] ;
                ] ;
            ] ;
        .
    }
  `)
  const conceptSchemeNode = namedNode('https://example.com/concept-scheme')
  const dataGraphNode = namedNode('urn:graph:data')
  const nodeShapeNode = namedNode('https://example.com/shapes/ConceptScheme')
  const schema = await shui.getSchema(conceptSchemeNode, dataGraphNode, nodeShapeNode)

  const hasTopConceptPredicate =
    schema[conceptSchemeNode.value].predicates[skos.hasTopConcept.value]
  const values = hasTopConceptPredicate.values
  expect(values.length).toBe(1)

  const editors = values[0].widgets.editors
  expect(editors.length).toBeGreaterThanOrEqual(3)

  let dashAutoCompleteEditorWidget = null
  for (const editor of editors) {
    if (editor.type.equals(dash.AutoCompleteEditor)) {
      dashAutoCompleteEditorWidget = editor
    }
  }

  expect(dashAutoCompleteEditorWidget).toBeTruthy()

  const autocompleteResults = await shui.getAutoCompleteEditorValues(
    hasTopConceptPredicate.constraintComponents,
    dataGraphNode
  )
  expect(autocompleteResults.length).toBe(2)
})

test('Expect 4 concepts because no sh:node here to filter the concept scheme', async () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX : <https://example.com/>
    PREFIX shape: <https://example.com/shapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    <urn:graph:data> {
        :concept-scheme a skos:ConceptScheme ;
            skos:hasTopConcept :concept-1 ;
        .
        
        :concept-1 a skos:Concept ;
            skos:prefLabel "Concept 1" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-2 a skos:Concept ;
            skos:prefLabel "Concept 2" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-3 a skos:Concept ;
            skos:prefLabel "Concept 3" ;
            skos:inScheme :concept-scheme ;
        .
        
        :concept-4 a skos:Concept ;
            skos:prefLabel "Concept 4" ;
            skos:inScheme :another-concept-scheme ;
        .
    }
    
    <urn:system:graph:shacl> {
        shape:ConceptScheme a sh:NodeShape ;
            sh:targetClass skos:ConceptScheme ;
            sh:property [
                sh:name "Top Concepts" ;
                sh:path skos:hasTopConcept ;
                sh:class skos:Concept ;
            ] ;
        .
    }
  `)
  const conceptSchemeNode = namedNode('https://example.com/concept-scheme')
  const dataGraphNode = namedNode('urn:graph:data')
  const nodeShapeNode = namedNode('https://example.com/shapes/ConceptScheme')
  const schema = await shui.getSchema(conceptSchemeNode, dataGraphNode, nodeShapeNode)

  const hasTopConceptPredicate =
    schema[conceptSchemeNode.value].predicates[skos.hasTopConcept.value]
  const values = hasTopConceptPredicate.values
  expect(values.length).toBe(1)

  const editors = values[0].widgets.editors
  expect(editors.length).toBeGreaterThanOrEqual(3)

  let dashAutoCompleteEditorWidget = null
  for (const editor of editors) {
    if (editor.type.equals(dash.AutoCompleteEditor)) {
      dashAutoCompleteEditorWidget = editor
    }
  }

  expect(dashAutoCompleteEditorWidget).toBeTruthy()

  const autocompleteResults = await shui.getAutoCompleteEditorValues(
    hasTopConceptPredicate.constraintComponents,
    dataGraphNode
  )
  expect(autocompleteResults.length).toBe(4)
})
