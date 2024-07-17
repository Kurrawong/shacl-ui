import { test, expect } from '@jest/globals'
import { Shui } from '@/shui'

test('Instantiate a valid instance of Shui and read quads into the store', () => {
  const shui = new Shui()
  shui.parse(`
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX sh: <http://www.w3.org/ns/shacl#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        <urn:system:graph:shacl> {
            [] a sh:NodeShape, rdfs:Class ;
                rdfs:label "Catalog" ;
                sh:property _:1, _:2 ;
            .
            
            _:1 a sh:PropertyShape ;
                sh:path dcterms:identifier ;
                sh:datatype xsd:token
            .
            
            _:2 a sh:PropertyShape ;
                sh:path dcterms:created ;
            .
        }
    `)
  shui.shapes

  expect(shui.store.size).toBe(10)
})

test('Throws error on invalid NodeShape having an sh:path property', () => {
  const shui = new Shui()
  shui.parse(`
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
          PREFIX dcterms: <http://purl.org/dc/terms/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sh: <http://www.w3.org/ns/shacl#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
          <urn:system:graph:shacl> {
              dcat:Catalog a sh:NodeShape, rdfs:Class ;
                  rdfs:label "Catalog" ;
                  sh:path <urn:system:graph:shacl> ;
                  sh:property [
                      sh:path dcterms:identifier ;
                      sh:datatype xsd:token
                  ]
              .
          }
    `)

  expect(() => shui.shapes).toThrow(
    'A shape http://www.w3.org/ns/dcat#Catalog defined as a NodeShape cannot be the subject of a sh:path predicate'
  )
})

test('Throws error on invalid shape that is both a NodeShape and a PropertyShape', () => {
  const shui = new Shui()
  shui.parse(`
          PREFIX dcat: <http://www.w3.org/ns/dcat#>
          PREFIX dcterms: <http://purl.org/dc/terms/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sh: <http://www.w3.org/ns/shacl#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
          <urn:system:graph:shacl> {
              dcat:Catalog a sh:NodeShape, sh:PropertyShape ;
                  rdfs:label "Catalog" ;
                  sh:property [
                      sh:path dcterms:identifier ;
                      sh:datatype xsd:token
                  ]
              .
          }
    `)

  expect(() => shui.shapes).toThrow(
    'A shape http://www.w3.org/ns/dcat#Catalog defined as a NodeShape cannot also be defined as a PropertyShape'
  )
})

test('Throws error on invalid PropertyShape missing sh:path', () => {
  const shui = new Shui()
  shui.parse(`
          PREFIX dcat: <http://www.w3.org/ns/dcat#>
          PREFIX dcterms: <http://purl.org/dc/terms/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sh: <http://www.w3.org/ns/shacl#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
          <urn:system:graph:shacl> {
              <urn:shape:identifier> a sh:PropertyShape .
          }
    `)

  expect(() => shui.shapes).toThrow('defined as a PropertyShape must include one sh:path property')
})

test('Throws error on invalid PropertyShape having more than one sh:path', () => {
  const shui = new Shui()
  shui.parse(`
          PREFIX dcat: <http://www.w3.org/ns/dcat#>
          PREFIX dcterms: <http://purl.org/dc/terms/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sh: <http://www.w3.org/ns/shacl#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          
          <urn:system:graph:shacl> {
              <urn:shape:identifier> a sh:PropertyShape ;
                sh:path dcterms:identifier ;
                sh:path dcterms:created ;
              .
          }
    `)

  expect(() => shui.shapes).toThrow(
    'defined as a PropertyShape cannot have more than one sh:path property'
  )
})
