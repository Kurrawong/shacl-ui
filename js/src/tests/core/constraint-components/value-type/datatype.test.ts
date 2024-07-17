import { expect, test } from '@jest/globals'
import { Shui } from '@/shui'
import { DataFactory } from 'n3'
import type { Shape } from '@/types'
import { sh } from '@/core/namespaces'
import { DatatypeConstraintComponent } from '@/core/constraint-components/value-type/datatype'
import namedNode = DataFactory.namedNode
import { visitShape } from '@/core/constraint-components/visit-shape'

const SHAPES_GRAPH_NAME = namedNode('urn:system:graph:shacl')

// TODO: The mapping function needs to be implemented in the core.
// test('Correctly maps the SHACL parameters to the DatatypeConstraintComponent', () => {
//   const shui = new Shui()
//   shui.parse(`
//     PREFIX aussies: <https://example.com/aussies/>
//     PREFIX aushapes: <https://example.com/aushapes/>
//     PREFIX dash: <http://datashapes.org/dash#>
//     PREFIX schema: <https://schema.org/>
//     PREFIX sh: <http://www.w3.org/ns/shacl#>
//     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//     PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
//
//     <urn:graph:data> {
//       aussies:Holger
//         a schema:Person ;
//         rdfs:label "Holger Knublach" ;
//         schema:givenName "Holger" ;
//         schema:familyName "Knublach" ;
//         schema:address aussies:HolgersAddress .
//
//       aussies:HolgersAddress
//         a schema:PostalAddress ;
//         schema:streetAddress "3 Teewah Close" ;
//         schema:addressLocality "Kewarra Beach" ;
//         schema:addressRegion "QLD" ;
//         schema:postalCode "4879" ;
//         schema:email "holger@knublauch.com" ;
//         schema:email "holger@topquadrant.com" ;
//         rdfs:label "Holger's Address" .
//     }
//
//     <urn:system:graph:shacl> {
//       aushapes:AustralianPersonShape
//         a sh:NodeShape ;
//         rdfs:label "Australian person shape" ;
//         rdfs:comment "Defines the structure of persons in Australia, stored using schema.org." ;
//         sh:targetClass schema:Person ;
//         dash:defaultViewForRole dash:all ;
//         sh:property [
//           sh:path schema:givenName ;
//           sh:minCount 1 ;
//           sh:datatype xsd:token ;
//           sh:group aushapes:NamePropertyGroup ;
//           sh:order 0
//         ],
//         [
//           sh:path schema:familyName ;
//           sh:minCount 1 ;
//           sh:maxCount 1 ;
//           sh:datatype xsd:string ;
//           sh:group aushapes:NamePropertyGroup ;
//           sh:order 1
//         ],
//         [
//           sh:path schema:address ;
//           sh:node aushapes:AustralianAddressShape ;
//           sh:group aushapes:AddressPropertyGroup
//         ] .
//
//       aushapes:NamePropertyGroup
//         a sh:PropertyGroup ;
//         rdfs:label "Name" .
//
//       aushapes:AustralianAddressShape
//         a sh:NodeShape ;
//         rdfs:label "Australian address shape" ;
//         rdfs:comment "Defines the structure of addresses in Australia, stored using schema.org." ;
//         sh:targetClass schema:PostalAddress ;
//         dash:defaultViewForRole dash:all ;
//         sh:property aushapes:AustralianAddressShape-streetAddress ;
//         sh:property aushapes:AustralianAddressShape-addressLocality ;
//         sh:property aushapes:AustralianAddressShape-addressRegion ;
//         sh:property aushapes:AustralianAddressShape-postalCode ;
//         sh:property aushapes:AustralianAddressShape-email ;
//         sh:property aushapes:AustralianAddressShape-telephone .
//
//       aushapes:AustralianAddressShape-streetAddress
//         a sh:PropertyShape ;
//         sh:path schema:streetAddress ;
//         dash:editor dash:TextAreaEditor ;
//         dash:singleLine false ;
//         sh:datatype xsd:string ;
//         sh:group aushapes:AddressPropertyGroup ;
//         sh:maxCount 1 ;
//         sh:name "street address" ;
//         sh:order "0"^^xsd:decimal .
//
//       aushapes:AustralianAddressShape-addressLocality
//         a sh:PropertyShape ;
//         sh:path schema:addressLocality ;
//         sh:datatype xsd:string ;
//         sh:group aushapes:AddressPropertyGroup ;
//         sh:maxCount 1 ;
//         sh:name "suburb" ;
//         sh:order "1"^^xsd:decimal .
//
//       aushapes:AustralianAddressShape-addressRegion
//         a sh:PropertyShape ;
//         sh:path schema:addressRegion ;
//         sh:datatype xsd:string ;
//         sh:description "The abbreviation of the state or territory." ;
//         sh:group aushapes:AddressPropertyGroup ;
//         sh:in ( "ACT" "NSW" "NT" "QLD" "SA" "TAS" "VIC" "WA" ) ;
//         sh:minCount 1 ;
//         sh:maxCount 1 ;
//         sh:name "state" ;
//         sh:order "2"^^xsd:decimal .
//
//       aushapes:AustralianAddressShape-postalCode
//         a sh:PropertyShape ;
//         sh:path schema:postalCode ;
//         sh:datatype xsd:string ;
//         sh:description "An Australian postal code, between 0000 and 9999." ;
//         sh:group aushapes:AddressPropertyGroup ;
//         sh:minCount 1 ;
//         sh:maxCount 1 ;
//         sh:minLength 4 ;
//         sh:maxLength 4 ;
//         sh:name "postal code" ;
//         sh:order "3"^^xsd:decimal ;
//         sh:pattern "[0-9][0-9][0-9][0-9]" .
//
//       aushapes:AustralianAddressShape-email
//         a sh:PropertyShape ;
//         sh:path schema:email ;
//         sh:datatype xsd:string ;
//         sh:group aushapes:ContactPropertyGroup ;
//         sh:name "email" ;
//         sh:nodeKind sh:Literal ;
//         sh:order "1"^^xsd:decimal .
//
//       aushapes:AustralianAddressShape-telephone
//         a sh:PropertyShape ;
//         sh:path schema:telephone ;
//         sh:datatype xsd:string ;
//         sh:group aushapes:ContactPropertyGroup ;
//         sh:name "phone number" ;
//         sh:order "2"^^xsd:decimal .
//
//       aushapes:AddressPropertyGroup
//         a sh:PropertyGroup ;
//         rdfs:label "Address" ;
//         sh:order "0"^^xsd:decimal .
//
//       aushapes:ContactPropertyGroup
//         a sh:PropertyGroup ;
//         rdfs:label "Contact" ;
//         sh:order "1"^^xsd:decimal .
//     }
//   `)
//   const { validator } = shui.createValidator(namedNode('urn:graph:data'))
//   const nodeShapePtr = validator.shapesPtr.node([
//     namedNode('https://example.com/aushapes/AustralianPersonShape')
//   ])
//
//   let constraintCount = 0
//   for (const propShapePtr of nodeShapePtr.out([sh.property])) {
//     const propShape: Shape = validator.shape(propShapePtr)
//     const constraintComponents = shapeToConstraintComponents(propShape, SHAPES_GRAPH_NAME)
//     constraintCount += constraintComponents.length
//   }
//
//   expect(constraintCount).toBe(2)
// })

test('DatatypeConstraintComponent errors if a shape has no sh:datatype', () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX aussies: <https://example.com/aussies/>
    PREFIX aushapes: <https://example.com/aushapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    <urn:system:graph:shacl> {
      aushapes:AustralianPersonShape
      a sh:NodeShape ;
      rdfs:label "Australian person shape" ;
      rdfs:comment "Defines the structure of persons in Australia, stored using schema.org." ;
      sh:targetClass schema:Person ;
      dash:defaultViewForRole dash:all ;
      sh:property [
        sh:path schema:address ;
        sh:node aushapes:AustralianAddressShape ;
        sh:group aushapes:AddressPropertyGroup
      ] .
    }
  `)
  const { validator } = shui.createValidator(namedNode('urn:graph:data'))
  const nodeShapePtr = validator.shapesPtr.node([
    namedNode('https://example.com/aushapes/AustralianPersonShape')
  ])
  const propShapePtr = nodeShapePtr.out([sh.property]).ptrs
  if (propShapePtr === undefined) throw Error('Did not expect this to be undefined')
  const propShape = validator.shape(propShapePtr[0])
  expect(() => new DatatypeConstraintComponent(propShape)).toThrow(
    'DatatypeConstraintComponent must have at least one sh:datatype predicate.'
  )
})

test('DatatypeConstraintComponent errors if a shape has more than one sh:datatype', () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX aussies: <https://example.com/aussies/>
    PREFIX aushapes: <https://example.com/aushapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    <urn:system:graph:shacl> {
      aushapes:AustralianPersonShape
      a sh:NodeShape ;
      rdfs:label "Australian person shape" ;
      rdfs:comment "Defines the structure of persons in Australia, stored using schema.org." ;
      sh:targetClass schema:Person ;
      dash:defaultViewForRole dash:all ;
      sh:property [
        sh:path schema:address ;
        sh:datatype xsd:string ;
        sh:datatype xsd:token ;
        sh:node aushapes:AustralianAddressShape ;
        sh:group aushapes:AddressPropertyGroup
      ] .
    }
  `)
  const { validator } = shui.createValidator(namedNode('urn:graph:data'))
  const nodeShapePtr = validator.shapesPtr.node([
    namedNode('https://example.com/aushapes/AustralianPersonShape')
  ])
  const propShapePtr = nodeShapePtr.out([sh.property]).ptrs
  if (propShapePtr === undefined) throw Error('Did not expect this to be undefined')
  const propShape = validator.shape(propShapePtr[0])
  expect(() => new DatatypeConstraintComponent(propShape)).toThrow(
    'DatatypeConstraintComponent must have at least one sh:datatype predicate.'
  )
})

test('DatatypeConstraintComponent errors if a shape does not have an IRI for the sh:datatype value', () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX aussies: <https://example.com/aussies/>
    PREFIX aushapes: <https://example.com/aushapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    <urn:system:graph:shacl> {
      aushapes:AustralianPersonShape
      a sh:NodeShape ;
      rdfs:label "Australian person shape" ;
      rdfs:comment "Defines the structure of persons in Australia, stored using schema.org." ;
      sh:targetClass schema:Person ;
      dash:defaultViewForRole dash:all ;
      sh:property [
        sh:path schema:address ;
        sh:datatype "string" ;
        sh:group aushapes:AddressPropertyGroup
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
  expect(() => new DatatypeConstraintComponent(propShape)).toThrow(
    'DatatypeConstraintComponent must have an IRI as the value for sh:datatype predicate'
  )
})

test("DatatypeConstraintComponent instance's datatype getter correctly returns the NamedNode", () => {
  const shui = new Shui()
  shui.parse(`
    PREFIX aussies: <https://example.com/aussies/>
    PREFIX aushapes: <https://example.com/aushapes/>
    PREFIX dash: <http://datashapes.org/dash#>
    PREFIX schema: <https://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    <urn:system:graph:shacl> {
      aushapes:AustralianPersonShape
      a sh:NodeShape ;
      rdfs:label "Australian person shape" ;
      rdfs:comment "Defines the structure of persons in Australia, stored using schema.org." ;
      sh:targetClass schema:Person ;
      dash:defaultViewForRole dash:all ;
      sh:property [
        sh:path schema:address ;
        sh:datatype xsd:string ;
        sh:group aushapes:AddressPropertyGroup
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
  expect(new DatatypeConstraintComponent(propShape).datatype.id).toBe(
    'http://www.w3.org/2001/XMLSchema#string'
  )
})
