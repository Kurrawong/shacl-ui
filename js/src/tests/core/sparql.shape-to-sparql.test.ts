import { expect, test } from '@jest/globals'
import { Shui } from '@/shui'
import { sh } from '@/core/namespaces'
import { DataFactory } from 'n3'
import { shapeToSparql } from '@/core/sparql'
import blankNode = DataFactory.blankNode

test('Shape to sparql', () => {
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
    
    shape:ConceptScheme a sh:NodeShape ;
      sh:targetClass skos:ConceptScheme ;
      sh:property [
        sh:name "Top Concepts" ;
        sh:path skos:hasTopConcept ;
        sh:class skos:Concept ;
        sh:node _:node-concept-scheme ;
      ] .
    
    _:node-concept-scheme sh:property [
      sh:path skos:inScheme ;
      sh:hasValue :concept-scheme ;
    ] .
  `)
  const quads = shui.store.getQuads(null, sh.property, null, null)
  const node = blankNode(quads[1].subject.value)

  const query = shapeToSparql(node, shui.store, null)
  expect(query).toContain('PREFIX skos: <http://www.w3.org/2004/02/skos/core#>')
  expect(query).toContain('skos:inScheme')
  expect(query).toContain('<https://example.com/concept-scheme>')
  expect(query).toContain('CONSTRUCT { ?resource1 skos:inScheme ?resource2. }')
})
