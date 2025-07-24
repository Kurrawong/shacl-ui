import { describe, it, expect } from 'vitest'
import { DataFactory, Store, Parser } from 'n3'
import { dash, sh, skos } from '@/lib/namespaces'
import { UISHACLValidator } from '@/lib/shapes-graph'

const { namedNode } = DataFactory
const parser = new Parser()

describe('Test dash:singleLine', () => {
  it('should validate a literal with a new line and return false', async () => {
    const dataQuads = parser.parse(`
      PREFIX : <https://example.com/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      :fruits a skos:ConceptScheme ;
        skos:prefLabel """
        Fruits
        """ ;
      .
    `)

    const shapesQuads = parser.parse(`
      PREFIX dash: <http://datashapes.org/dash#>
      PREFIX sh: <http://www.w3.org/ns/shacl#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      BASE <https://example.com/>

      <NodeShape> a sh:NodeShape ;
        sh:targetClass skos:ConceptScheme ;
        sh:property <ConceptScheme-prefLabel> ;
      .

      <ConceptScheme-prefLabel> a sh:PropertyShape ;
        sh:path skos:prefLabel ;
        dash:singleLine true ;
      .
    `)

    const dataGraph = new Store(dataQuads)
    const shapeGraph = new Store()
    shapeGraph.addQuads(shapesQuads)
    const validator = new UISHACLValidator(shapeGraph)
    const result = await validator.validate(dataGraph)
    expect(result.conforms).toBe(false)

    const validationResult = result.results[0]
    expect(validationResult.focusNode.equals(namedNode('https://example.com/fruits'))).toBe(true)
    expect(validationResult.severity.equals(sh.Violation)).toBe(true)
    expect(
      validationResult.sourceConstraintComponent.equals(dash.SingleLineConstraintComponent),
    ).toBe(true)
    expect(
      validationResult.sourceShape.equals(namedNode('https://example.com/ConceptScheme-prefLabel')),
    ).toBe(true)
    expect(validationResult.path.equals(skos.prefLabel)).toBe(true)
    expect(validationResult.message[0].value).toBe(
      'Value must be a literal and contain no new lines.',
    )
  })
})

describe('Test dash:singleLine', () => {
  it('should validate a non-literal and return false', async () => {
    const dataQuads = parser.parse(`
      PREFIX : <https://example.com/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      :fruits a skos:ConceptScheme ;
        skos:prefLabel :some-iri ;
      .
    `)

    const shapesQuads = parser.parse(`
      PREFIX dash: <http://datashapes.org/dash#>
      PREFIX sh: <http://www.w3.org/ns/shacl#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      BASE <https://example.com/>

      <NodeShape> a sh:NodeShape ;
        sh:targetClass skos:ConceptScheme ;
        sh:property <ConceptScheme-prefLabel> ;
      .

      <ConceptScheme-prefLabel> a sh:PropertyShape ;
        sh:path skos:prefLabel ;
        dash:singleLine true ;
      .
    `)

    const dataGraph = new Store(dataQuads)
    const shapeGraph = new Store()
    shapeGraph.addQuads(shapesQuads)
    const validator = new UISHACLValidator(shapeGraph)
    const result = await validator.validate(dataGraph)
    expect(result.conforms).toBe(false)

    const validationResult = result.results[0]
    expect(validationResult.focusNode.equals(namedNode('https://example.com/fruits'))).toBe(true)
    expect(validationResult.severity.equals(sh.Violation)).toBe(true)
    expect(
      validationResult.sourceConstraintComponent.equals(dash.SingleLineConstraintComponent),
    ).toBe(true)
    expect(
      validationResult.sourceShape.equals(namedNode('https://example.com/ConceptScheme-prefLabel')),
    ).toBe(true)
    expect(validationResult.path.equals(skos.prefLabel)).toBe(true)
    expect(validationResult.message[0].value).toBe(
      'Value must be a literal and contain no new lines.',
    )
  })
})

describe('Test dash:singleLine', () => {
  it('should validate and return true', async () => {
    const dataQuads = parser.parse(`
      PREFIX : <https://example.com/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      :fruits a skos:ConceptScheme ;
        skos:prefLabel "Fruits" ;
      .
    `)

    const shapesQuads = parser.parse(`
      PREFIX dash: <http://datashapes.org/dash#>
      PREFIX sh: <http://www.w3.org/ns/shacl#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      BASE <https://example.com/>

      <NodeShape> a sh:NodeShape ;
        sh:targetClass skos:ConceptScheme ;
        sh:property <ConceptScheme-prefLabel> ;
      .

      <ConceptScheme-prefLabel> a sh:PropertyShape ;
        sh:path skos:prefLabel ;
        dash:singleLine true ;
      .
    `)

    const dataGraph = new Store(dataQuads)
    const shapeGraph = new Store()
    shapeGraph.addQuads(shapesQuads)
    const validator = new UISHACLValidator(shapeGraph)
    const result = await validator.validate(dataGraph)
    expect(result.conforms).toBe(true)
  })
})

describe('Test dash:singleLine', () => {
  it('should validate a literal with a new line and return false', async () => {
    const dataQuads = parser.parse(`
      PREFIX : <https://example.com/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      :fruits a skos:ConceptScheme ;
        skos:prefLabel """
        Fruits
        """ ;
      .
    `)

    const shapesQuads = parser.parse(`
      PREFIX dash: <http://datashapes.org/dash#>
      PREFIX sh: <http://www.w3.org/ns/shacl#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      BASE <https://example.com/>

      <NodeShape> a sh:NodeShape ;
        sh:targetClass skos:ConceptScheme ;
        sh:property <ConceptScheme-prefLabel> ;
      .

      <ConceptScheme-prefLabel> a sh:PropertyShape ;
        sh:path skos:prefLabel ;
        dash:singleLine true ;
      .
    `)

    const dataGraph = new Store(dataQuads)
    const shapeGraph = new Store()
    shapeGraph.addQuads(shapesQuads)
    const validator = new UISHACLValidator(shapeGraph)
    const shape = validator.shapesGraph.getShape(
      namedNode('https://example.com/ConceptScheme-prefLabel'),
    )

    for (const constraint of shape.constraints) {
      console.log(`Constraint: ${constraint.component.node.value}`)
      console.log(`Constraint parameters: ${JSON.stringify(constraint.component.parameters)}`)
      console.log(`Constraint parameter value: ${constraint.paramValue.value}`)
      for (const valueNode of shape.getValueNodes(
        namedNode('https://example.com/fruits'),
        validator.factory.clownface({ dataset: dataGraph }),
      )) {
        console.log(`Value node: ${valueNode.value}`)
        console.log(`Validate: ${constraint.validate(namedNode('https://example.com/fruits'), valueNode)}`)
      }
    }
  })
})
