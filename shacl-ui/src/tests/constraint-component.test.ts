import { describe, it, expect } from 'vitest'
import { DataFactory, Store, Parser } from 'n3'
import { rdf, sh } from '@/lib/namespaces'
import { ClassConstraintComponent } from '@/lib/constraint-components'
import SHACLValidator from 'rdf-validate-shacl'
import { Shape } from 'rdf-validate-shacl/src/shapes-graph'

const { namedNode, blankNode, quad } = DataFactory
const parser = new Parser()

describe('Test ClassConstraintComponent', () => {
  it('should throw error because no sh:class parameters are present', () => {
    const shapeNode = blankNode('shape1')
    const store = new Store()
    store.add(quad(shapeNode, rdf.type, sh.PropertyShape))
    expect(() => new ClassConstraintComponent(shapeNode, store)).toThrow(
      'sh:ClassConstraintComponent must have at least one sh:class parameter.',
    )
  })
})

describe('Test ClassConstraintComponent', () => {
  it('should throw error because sh:class parameter is not an IRI', () => {
    const shapeNode = blankNode('shape1')
    const store = new Store()
    store.add(quad(shapeNode, rdf.type, sh.PropertyShape))
    store.add(quad(shapeNode, sh.class, blankNode('class1')))
    expect(() => new ClassConstraintComponent(shapeNode, store)).toThrow(
      'sh:class parameter must be an IRI.',
    )
  })
})

describe('Test ClassConstraintComponent', () => {
  it('is a valid class constraint component', () => {
    const shapeNode = blankNode('shape1')
    const store = new Store()
    store.add(quad(shapeNode, rdf.type, sh.PropertyShape))
    store.add(quad(shapeNode, sh.class, namedNode('http://example.com/class')))
    const classConstraintComponent = new ClassConstraintComponent(shapeNode, store)
    expect(classConstraintComponent.type()).toEqual(sh.ClassConstraintComponent)
    expect(classConstraintComponent.classes()).toEqual([namedNode('http://example.com/class')])
  })
})

describe('Test ClassConstraintComponent', () => {
  it('is a valid class constraint component with multiple classes', () => {
    const shapeNode = blankNode('shape1')
    const store = new Store()
    store.add(quad(shapeNode, rdf.type, sh.PropertyShape))
    store.add(quad(shapeNode, sh.class, namedNode('http://example.com/class1')))
    store.add(quad(shapeNode, sh.class, namedNode('http://example.com/class2')))
    const classConstraintComponent = new ClassConstraintComponent(shapeNode, store)
    expect(classConstraintComponent.type()).toEqual(sh.ClassConstraintComponent)
    expect(classConstraintComponent.classes()).toEqual([
      namedNode('http://example.com/class1'),
      namedNode('http://example.com/class2'),
    ])
  })
})

describe('Test rdf-validate-shacl', () => {
  it('is a valid class constraint component with multiple classes', async () => {
    const dataQuads = parser.parse(`
PREFIX schema: <https://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<https://example.com/fruits>
	a skos:ConceptScheme ;
	skos:prefLabel "Fruits" ;
	skos:definition "A fruits vocabulary" ;
	schema:dateCreated "2025-07-14"^^xsd:date ;
	skos:hasTopConcept <https://example.com/apple> ;
.

<https://example.com/apple> a skos:Concept ;
	skos:prefLabel "apple" ;
	skos:definition "An apple a day keeps the doctor away." ;
	skos:inScheme <https://example.com/fruits> ;
	skos:topConceptOf <https://example.com/fruits> ;
	skos:narrower <urn:red-apple> ;
.

<urn:red-apple> a skos:Concept ;
	skos:broader <https://example.com/apple> ;
	skos:prefLabel "red apple" ;
.

<urn:dark-red-apple> a skos:Concept ;
	skos:broader <urn:red-apple> ;
	skos:prefLabel "dark red apple" ;
.

<http://example.com/red-fruits>
	a skos:Collection ;
	skos:prefLabel "Red Fruits" ;
	skos:definition "A collection of red fruits." ;
	skos:member <https://example.com/apple> ;
.
      `)
    const shapesQuads = parser.parse(`
PREFIX dash: <http://datashapes.org/dash#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX reg: <http://purl.org/linked-data/registry#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <https://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
BASE <https://linked.data.gov.au/def/vocpub/validator/>

<ConceptSchemeList> a sh:NodeShape ;
	sh:targetClass skos:ConceptScheme ;
	sh:property [
		sh:path [ sh:inversePath skos:topConceptOf ] ;
		sh:node <ConceptList> ;
	]
.

<ConceptList> a sh:NodeShape ;
	sh:class skos:Concept ;
	sh:property [
		sh:path [ sh:inversePath skos:broader ] ;
		sh:node <ConceptList>
	],
	[
		sh:path skos:prefLabel ;
		sh:minCount 1
	]
.
      `)
    const dataGraph = new Store()
    dataGraph.addQuads(dataQuads)
    const shapeGraph = new Store()
    shapeGraph.addQuads(shapesQuads)
    const validator = new SHACLValidator(shapeGraph)
    const result = await validator.validate(dataGraph)
    expect(result.conforms).toBe(true)

    const focusNode = namedNode('https://example.com/fruits')
    const nodeShape = namedNode('https://linked.data.gov.au/def/vocpub/validator/ConceptSchemeList')
    const shape = new Shape(validator, nodeShape)

    // Convert N3 Store to clownface pointer for getValueNodes
    const dataGraphPointer = validator.factory.clownface({ dataset: dataGraph })
    console.log(`Value nodes: ${JSON.stringify(shape.getValueNodes(focusNode, dataGraphPointer))}`)
    for (const constraint of shape.constraints) {
      console.log('===')
      console.log(`Focus Node: ${focusNode.value}`)
      console.log(`Constraint Component: ${constraint.component.node.value}`)
      console.log(`Constraint parameters: ${JSON.stringify(constraint.component.parameters)}`)
      console.log(`Constraint parameter value: ${constraint.paramValue.value}`)

      if (constraint.component.node.equals(sh.PropertyConstraintComponent)) {
        const propertyShape = new Shape(validator, constraint.paramValue)
        console.log(`Path object: ${JSON.stringify(propertyShape.pathObject)}`)
        console.log(
          `Value nodes: ${JSON.stringify(propertyShape.getValueNodes(focusNode, dataGraphPointer))}`,
        )
      }
    }
  })
})
