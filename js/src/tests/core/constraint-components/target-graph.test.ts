import { expect, test } from '@jest/globals'
import { Shui } from '@/shui'
import { DataFactory } from 'n3'
import { sh } from '@/core/namespaces'
import namedNode = DataFactory.namedNode
import { TargetGraphConstraintComponent } from '@/core/constraint-components/target-graph'

test("DatatypeConstraintComponent instance's datatype getter correctly returns the NamedNode", () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX : <https://example.com/>
    PREFIX aushapes: <https://example.com/aushapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX freq: <http://purl.org/cld/freq/>
    PREFIX gswa: <https://example.com/gswa/data/>
    PREFIX gswa-shapes: <https://example.com/gswa/shapes/>
    PREFIX gswa-epsg-cc: <https://example.com/gswa/epsg>
    PREFIX gswa-epsg: <https://example.com/gswa/epsg/>
    PREFIX gswa-roles-cc: <https://example.com/gswa/role>
    PREFIX gswa-roles: <https://example.com/gswa/role/>
    PREFIX gswa-status-cc: <https://example.com/gswa/status>
    PREFIX gswa-status: <https://example.com/gswa/status/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX sdo: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX shx: <http://www.w3.org/ns/shacl-x#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    <urn:system:graph:shacl> {
      aushapes:AustralianPersonShape
      a sh:NodeShape ;
      sh:property [
        sh:name "Search Words" ;
        sh:path sdo:keywords ;
        sh:class skos:Concept ;
        shx:targetGraph <urn:graph:vocabs> ;
        sh:node [
            sh:property [
                sh:path skos:inScheme ;
                sh:hasValue <https://linked.data.gov.au/def/GSWA-vocabulary-themes> ;
            ]
        ]
      ] .
    }
  `)
  const { validator } = shui.createValidator(namedNode('urn:graph:data'))
  const nodeShapePtr = validator.shapesPtr.node([
    namedNode('https://example.com/aushapes/AustralianPersonShape')
  ])
  const propShapePtr = Array.from(nodeShapePtr.out([sh.property]))
  if (propShapePtr === undefined) throw Error('Did not expect this to be undefined')
  const propShape = validator.shape(propShapePtr[0])
  expect(new TargetGraphConstraintComponent(propShape).targetGraphs.length).toBe(1)
  expect(new TargetGraphConstraintComponent(propShape).targetGraphs[0].value).toBe(
    'urn:graph:vocabs'
  )
})
