import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SHACLForm from '../components/SHACLForm.vue'

const meta = {
  title: 'Components/SHACLForm',
  component: SHACLForm,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    focusNode: { control: 'text' },
    dataGraph: { control: 'text' },
    shapesGraph: { control: 'text' },
    nodeShape: { control: 'text' },
  },
  args: {
    focusNode: 'urn:example:person:1',
    dataGraph: 'urn:graph:data',
    shapesGraph: 'urn:graph:shapes',
    nodeShape: null,
  },
} satisfies Meta<typeof SHACLForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default SHACL form with basic configuration.
 * This story shows the component with minimal required props.
 */
export const Default: Story = {
  args: {
    focusNode: 'https://example.com/fruits',
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
          <ConceptScheme-inScheme>,
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
          sh:message "Requirement 2.1.4, 2.2.1 or 2.3.1 Each vocabulary, Collection or Concept MUST have exactly one title and at least one definition indicated using the skos:prefLabel and the skos:definition predicates respectively that must give textual literal values. Only one definition per language is allowed" ;
          sh:path skos:prefLabel ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:uniqueLang true ;
          sh:or (
              [ sh:datatype xsd:string ]
              [ sh:datatype rdf:langString ]
          ) ;
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
          sh:or (
              [ sh:datatype xsd:dateTime ]
              [ sh:datatype xsd:date ]
              [ sh:datatype xsd:dateTimeStamp ]
          ) ;
      .
    `,
    nodeShape: 'https://linked.data.gov.au/def/vocpub/validator/ConceptScheme',
  },
}
