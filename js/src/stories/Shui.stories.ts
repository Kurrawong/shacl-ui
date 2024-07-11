import type { Meta, StoryObj } from '@storybook/vue3'
import Shui from '@/components/Shui.vue'

const meta = {
  title: 'SHACL UI',
  component: Shui,
  tags: ['autodocs']
} satisfies Meta<typeof Shui>

export default meta

type Story = StoryObj<typeof meta>

const dataStr = `
@prefix dash: <http://datashapes.org/dash#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sdo: <https://schema.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<urn:graph:data> {
    <urn:shape:NodeShape> a sh:NodeShape ;
        sh:targetClass sh:NodeShape ;
        rdfs:label "Node Shape" ;
        rdfs:comment "A SHACL Node Shape for creating new SHACL shapes." ;
        sh:property [
            sh:path rdfs:label ;
            sh:nodeKind sh:Literal ;
            sh:or dash:StringOrLangString ;
            dash:propertyRole dash:LabelRole ;
            sh:order 0 ;
        ],
        [
            sh:path rdfs:comment ;
            sh:nodeKind sh:Literal ;
            sh:or dash:StringOrLangString ;
            dash:propertyRole dash:DescriptionRole ;
        ] ;
        sh:or (
            [
                sh:path rdf:type ;
                sh:nodeKind sh:IRI ;
                sh:or (
                    [
                        dash:rootClass rdfs:Class ;
                    ]
                    [
                        dash:rootClass owl:Class
                    ]
                )
            ]
            [
                sh:path sh:targetClass ;
                sh:nodeKind sh:IRI ;
                sh:or (
                    [
                        dash:rootClass rdfs:Class ;
                    ]
                    [
                        dash:rootClass owl:Class
                    ]
                )
            ]
        ) ;
    .
}

<urn:system:graph:shacl> {
    <urn:shape:NodeShape> a sh:NodeShape ;
        sh:targetClass sh:NodeShape ;
        rdfs:label "Node Shape" ;
        rdfs:comment "A SHACL Node Shape for creating new SHACL shapes." ;
        sh:property [
            sh:path rdfs:label ;
            sh:nodeKind sh:Literal ;
            sh:or dash:StringOrLangString ;
            dash:propertyRole dash:LabelRole ;
            sh:order 0 ;
        ],
        [
            sh:path rdfs:comment ;
            sh:nodeKind sh:Literal ;
            sh:or dash:StringOrLangString ;
            dash:propertyRole dash:DescriptionRole ;
        ] ;
        sh:or (
            [
                sh:path rdf:type ;
                sh:nodeKind sh:IRI ;
                sh:or (
                    [
                        dash:rootClass rdfs:Class ;
                    ]
                    [
                        dash:rootClass owl:Class
                    ]
                )
            ]
            [
                sh:path sh:targetClass ;
                sh:nodeKind sh:IRI ;
                sh:or (
                    [
                        dash:rootClass rdfs:Class ;
                    ]
                    [
                        dash:rootClass owl:Class
                    ]
                )
            ]
        ) ;
    .
}

`

const dataStr2 = `
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX idnth: <https://data.idnau.org/pid/vocab/idn-th/>
PREFIX idnroles: <https://data.idnau.org/pid/vocab/idn-role-codes/>
PREFIX isoroles: <https://linked.data.gov.au/def/data-roles/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sdo: <https://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<urn:system:graph:labels> {
    <https://data.idnau.org/pid/system/catprez> rdfs:label "CatPrez System Catalogue" .
    isoroles:author rdfs:label "author"@en .
    isoroles:owner rdfs:label "owner"@en .
    isoroles:custodian rdfs:label "custodian"@en .
    <https://data.idnau.org/pid/democat> rdfs:label "IDN Demonstration Catalogue" .
    <https://data.idnau.org/pid/isucat> rdfs:label "Indigenous Studies Unit Catalogue" .
    dcat:Catalog rdfs:label "Catalog"@en .
    dcterms:identifier rdfs:label "Identifier"@en .
    dcterms:title rdfs:label "Title"@en .
    dcterms:description rdfs:label "Description"@en .
    dcterms:created rdfs:label "Created"@en .
    dcterms:modified rdfs:label "Modified"@en .
    xsd:token rdfs:label "xsd:token" .
    xsd:date rdfs:label "xsd:date" .
    prov:qualifiedAttribution rdfs:label "qualifiedAttribution" .
    prov:Attribution rdfs:label "Attribution" .
    prov:agent rdfs:label "agent" .
    dcat:hadRole rdfs:label "hadRole"@en .
    dcterms:hasPart rdfs:label "Has Part" .
    <https://orcid.org/0000-0002-8742-7730> rdfs:label "Nicholas Car" .
}

<urn:graph:data> {
    <https://data.idnau.org/pid/system/catprez>
        a dcat:Catalog ;
        dcterms:identifier "catprez"^^xsd:token ;
        dcterms:identifier "c"^^xsd:token ;
        dcterms:title "CatPrez System Catalogue" ;
        dcterms:description """This is the system catalogue implemented by this instance of CatPrez that lists all its other Catalog instances"""@en ;
        dcterms:created "2022-08-03"^^xsd:date ;
        dcterms:modified "2023-01-24"^^xsd:date ;
        prov:qualifiedAttribution [
            a prov:Attribution;
            prov:agent <https://orcid.org/0000-0002-8742-7730> ;
            dcat:hadRole
                isoroles:author ,
                isoroles:owner ,
                isoroles:custodian ;
        ] ;
        dcterms:hasPart
            <https://data.idnau.org/pid/democat> ,
            <https://data.idnau.org/pid/isucat> ;
    .
}

<urn:system:graph:shacl> {
    dcat:Catalog a sh:NodeShape ;
        rdfs:label "Catalog" ;
        sh:property [
            sh:path dcterms:identifier ;
            sh:datatype xsd:token
        ]
    .
}

`

const dataStr3 = `
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX idnth: <https://data.idnau.org/pid/vocab/idn-th/>
PREFIX idnroles: <https://data.idnau.org/pid/vocab/idn-role-codes/>
PREFIX isoroles: <https://linked.data.gov.au/def/data-roles/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sdo: <https://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<urn:system:graph:labels> {
    <https://data.idnau.org/pid/system/catprez> rdfs:label "CatPrez System Catalogue" .
    isoroles:author rdfs:label "author"@en .
    isoroles:owner rdfs:label "owner"@en .
    isoroles:custodian rdfs:label "custodian"@en .
    <https://data.idnau.org/pid/democat> rdfs:label "IDN Demonstration Catalogue" .
    <https://data.idnau.org/pid/isucat> rdfs:label "Indigenous Studies Unit Catalogue" .
    dcat:Catalog rdfs:label "Catalog"@en .
    dcterms:identifier rdfs:label "Identifier"@en .
    dcterms:title rdfs:label "Title"@en .
    dcterms:description rdfs:label "Description"@en .
    dcterms:created rdfs:label "Created"@en .
    dcterms:modified rdfs:label "Modified"@en .
    xsd:token rdfs:label "xsd:token" .
    xsd:date rdfs:label "xsd:date" .
    prov:qualifiedAttribution rdfs:label "qualifiedAttribution" .
    prov:Attribution rdfs:label "Attribution" .
    prov:agent rdfs:label "agent" .
    dcat:hadRole rdfs:label "hadRole"@en .
    dcterms:hasPart rdfs:label "Has Part" .
    <https://orcid.org/0000-0002-8742-7730> rdfs:label "Nicholas Car" .
}

<urn:graph:data> {
  <https://data.idnau.org/pid/system/catprez>
      a dcat:Catalog ;
      dcterms:identifier "catprez"^^xsd:token ;
      dcterms:identifier "c"^^xsd:token ;
      dcterms:title "CatPrez System Catalogue" ;
  .
}

<urn:system:graph:shacl> {
    dcat:Catalog a sh:NodeShape ;
        rdfs:label "Catalog" ;
        sh:property [
            sh:path dcterms:identifier ;
            sh:datatype xsd:token ;
            sh:minCount 1 ;
            sh:maxCount 1 ;
        ]
    .
}
`

export const Main: Story = {
  args: {
    dataStr: dataStr,
    graphName: {
      value: 'urn:graph:data',
      termType: 'NamedNode'
    }
  }
}

export const CatPrez: Story = {
  args: {
    dataStr: dataStr2,
    graphName: {
      value: 'urn:graph:data',
      termType: 'NamedNode'
    }
  }
}

export const Minimum: Story = {
  args: {
    dataStr: dataStr3,
    graphName: {
      value: 'urn:graph:data',
      termType: 'NamedNode'
    }
  }
}