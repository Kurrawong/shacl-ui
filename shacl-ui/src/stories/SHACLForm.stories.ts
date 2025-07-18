import type { Meta, StoryObj } from '@storybook/vue3-vite'
import n3 from 'n3'

import SHACLForm from '../components/SHACLForm.vue'

const { namedNode } = n3.DataFactory

const meta = {
  title: 'Components/SHACLForm',
  component: SHACLForm,
  tags: ['autodocs'],
  argTypes: {
    focusNode: {
      control: 'text',
      description: 'Enter IRI string (will be converted to NamedNode)',
    },
    dataGraph: {
      control: 'text',
      description: 'Enter Turtle data graph as string',
    },
    shapesGraph: {
      control: 'text',
      description: 'Enter Turtle shapes graph as string',
    },
    nodeShape: {
      control: 'text',
      description: 'Enter IRI string for node shape (will be converted to NamedNode)',
    },
  },
} satisfies Meta<typeof SHACLForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    // Transform string inputs to objects using factory functions
    const transformedArgs = {
      ...args,
      focusNode: typeof args.focusNode === 'string' ? namedNode(args.focusNode) : args.focusNode,
      nodeShape: typeof args.nodeShape === 'string' ? namedNode(args.nodeShape) : args.nodeShape,
    }

    return {
      components: { SHACLForm },
      setup() {
        return { args: transformedArgs }
      },
      template: '<SHACLForm v-bind="args" />',
    }
  },
  args: {
    focusNode: 'https://example.com/fruits' as any,

    dataGraph: `
      PREFIX schema: <https://schema.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      <https://example.com/fruits>
        a skos:ConceptScheme ;
        skos:prefLabel "Fruits" ;
        skos:definition "A fruits vocabulary" ;
        schema:dateCreated "2025-07-14"^^xsd:date ;
      .
      <https://example.com/apple> a skos:Concept ;
        skos:prefLabel "apple" ;
        skos:definition "An apple a day keeps the doctor away." ;
        skos:inScheme <https://example.com/fruits> ;
        skos:topConceptOf <https://example.com/fruits> ;
      .
      <http://example.com/red-fruits>
        a skos:Collection ;
        skos:prefLabel "Red Fruits" ;
        skos:definition "A collection of red fruits." ;
        skos:member <https://example.com/apple> ;
      .
    `,

    shapesGraph: `
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

      <ConceptScheme>
          a sh:NodeShape ;
          sh:targetClass skos:ConceptScheme ;
          sh:property	<prefLabel>,
              <definition>,
              <created>,
              [
                  sh:path [
                      sh:inversePath skos:inScheme ;
                  ] ;
                  sh:class skos:Concept ;
              ],
              [
                  sh:path [
                      sh:inversePath skos:topConceptOf ;
                  ] ;
                  sh:class skos:Concept ;
              ] ;
      .

      <Collection>
          a sh:NodeShape ;
          sh:targetClass skos:Collection ;
          sh:property <prefLabel>,
              <definition>,
              [
                  sh:path skos:member ;
                  sh:class skos:Concept ;
              ] ;
      .

      <Concept>
          a sh:NodeShape ;
          sh:targetClass skos:Concept ;
          sh:property	<prefLabel>,
              <definition> ;
      .

      <prefLabel>
          a sh:PropertyShape ;
          sh:name "preferred label" ;
          sh:message "Requirement 2.1.4, 2.2.1 or 2.3.1 Each vocabulary, Collection or Concept MUST have exactly one title and at least one definition indicated using the skos:prefLabel and the skos:definition predicates respectively that must give textual literal values. Only one definition per language is allowed" ;
          sh:path skos:prefLabel ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:uniqueLang true ;
          sh:or (
              [ sh:datatype xsd:string ]
              [ sh:datatype rdf:langString ]
          ) ;
          sh:group <Annotation-group> ;
          sh:order 0 ;
      .

      <definition>
          a sh:PropertyShape ;
          sh:message "Requirement 2.1.4, 2.2.1 or 2.3.1 Each vocabulary, Collection or Concept MUST have exactly one title and at least one definition indicated using the skos:prefLabel and the skos:definition predicates respectively that must give textual literal values. Only one definition per language is allowed" ;
          sh:path skos:definition ;
          sh:minCount 1 ;
          sh:uniqueLang true ;
          sh:or (
              [ sh:datatype xsd:string ]
              [ sh:datatype rdf:langString ]
          ) ;
          sh:group <Annotation-group> ;
          sh:order 1 ;
      .

      <created>
          a sh:PropertyShape ;
          sh:message "Requirement 2.15 - created date - violated" ;
          sh:path [
              sh:alternativePath (
                  schema:dateCreated
                  dcterms:created
              ) ;
          ] ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:group <Metadata-group> ;
          sh:or (
              [ sh:datatype xsd:dateTime ]
              [ sh:datatype xsd:date ]
              [ sh:datatype xsd:dateTimeStamp ]
          ) ;
      .

      <Annotation-group> a sh:PropertyGroup ;
          sh:order 0 ;
          rdfs:label "Annotations" ;
      .

      <Metadata-group> a sh:PropertyGroup ;
      .
    `,

    nodeShape: 'https://linked.data.gov.au/def/vocpub/validator/ConceptScheme' as any,
    isRootNode: true,
  },
}
