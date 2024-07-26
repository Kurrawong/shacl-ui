<script setup lang="ts">
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { ref, watch } from 'vue'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode
import RDFTextarea from '@/components/playground/RDFTextarea.vue'
import { useShui } from '@/composables/shui'

const { shui } = useShui()
const shacl = ref('')
const shaclUpdated = ref(false)
const data = ref('')
const dataUpdated = ref(false)

const examplesMenu = ref()
const exampleItems = ref([
  {
    label: "Holger's Address",
    command: () => {
      shacl.value = `\
PREFIX ex: <https://example.com/>
PREFIX aussies: <https://example.com/aussies/>
PREFIX aushapes: <https://example.com/aushapes/>
PREFIX dash: <http://datashapes.org/dash#>
PREFIX schema: <https://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
aushapes:AustralianPersonShape
  a sh:NodeShape ;
  rdfs:label "Australian person shape" ;
  rdfs:comment "Defines the structure of persons in Australia, stored using schema.org." ;
  sh:targetClass schema:Person ;
  dash:defaultViewForRole dash:all ;
  sh:property [
    sh:path schema:givenName ;
    sh:minCount 1 ;
    sh:datatype xsd:string ;
    sh:group aushapes:NamePropertyGroup ;
    sh:order 0 ;
    sh:name "given name"
  ],
  [
    sh:path schema:familyName ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype xsd:string ;
    sh:group aushapes:NamePropertyGroup ;
    sh:order 1
  ],
  [
    sh:path schema:address ;
    sh:node aushapes:AustralianAddressShape ;
    sh:group aushapes:AddressPropertyGroup
  ] .

aushapes:NamePropertyGroup
  a sh:PropertyGroup ;
  rdfs:label "Name" .

aushapes:AustralianAddressShape
  a sh:NodeShape ;
  rdfs:label "Australian address shape" ;
  rdfs:comment "Defines the structure of addresses in Australia, stored using schema.org." ;
  sh:targetClass schema:PostalAddress ;
  dash:defaultViewForRole dash:all ;
  sh:property aushapes:AustralianAddressShape-streetAddress ;
  sh:property aushapes:AustralianAddressShape-addressLocality ;
  sh:property aushapes:AustralianAddressShape-addressRegion ;
  sh:property aushapes:AustralianAddressShape-postalCode ;
  sh:property aushapes:AustralianAddressShape-email ;
  sh:property aushapes:AustralianAddressShape-telephone .

aushapes:AustralianAddressShape-streetAddress
  a sh:PropertyShape ;
  sh:path schema:streetAddress ;
  dash:editor dash:TextAreaEditor ;
  dash:singleLine false ;
  sh:datatype xsd:string ;
  sh:group aushapes:AddressPropertyGroup ;
  sh:maxCount 1 ;
  sh:name "street address" ;
  sh:order "0"^^xsd:decimal .

aushapes:AustralianAddressShape-addressLocality
  a sh:PropertyShape ;
  sh:path schema:addressLocality ;
  sh:datatype xsd:string ;
  sh:group aushapes:AddressPropertyGroup ;
  sh:maxCount 1 ;
  sh:name "suburb" ;
  sh:order "1"^^xsd:decimal .

aushapes:AustralianAddressShape-addressRegion
  a sh:PropertyShape ;
  sh:path schema:addressRegion ;
  sh:datatype xsd:string ;
  sh:description "The abbreviation of the state or territory." ;
  sh:group aushapes:AddressPropertyGroup ;
  sh:in ( "ACT" "NSW" "NT" "QLD" "SA" "TAS" "VIC" "WA" ) ;
  sh:minCount 1 ;
  sh:maxCount 1 ;
  sh:name "state" ;
  sh:order "2"^^xsd:decimal .

aushapes:AustralianAddressShape-postalCode
  a sh:PropertyShape ;
  sh:path schema:postalCode ;
  sh:datatype xsd:string ;
  sh:description "An Australian postal code, between 0000 and 9999." ;
  sh:group aushapes:AddressPropertyGroup ;
  sh:minCount 1 ;
  sh:maxCount 1 ;
  sh:minLength 4 ;
  sh:maxLength 4 ;
  sh:name "postal code" ;
  sh:order "3"^^xsd:decimal ;
  sh:pattern "[0-9][0-9][0-9][0-9]" .

aushapes:AustralianAddressShape-email
  a sh:PropertyShape ;
  sh:path schema:email ;
  sh:datatype xsd:string ;
  sh:group aushapes:ContactPropertyGroup ;
  sh:name "email" ;
  sh:nodeKind sh:Literal ;
  sh:order "1"^^xsd:decimal .

aushapes:AustralianAddressShape-telephone
  a sh:PropertyShape ;
  sh:path schema:telephone ;
  sh:datatype xsd:string ;
  sh:group aushapes:ContactPropertyGroup ;
  sh:name "phone number" ;
  sh:order "2"^^xsd:decimal .

aushapes:AddressPropertyGroup
  a sh:PropertyGroup ;
  rdfs:label "Address" ;
  sh:order "0"^^xsd:decimal .

aushapes:ContactPropertyGroup
  a sh:PropertyGroup ;
  rdfs:label "Contact" ;
  sh:order "1"^^xsd:decimal .
      `
      data.value = `\
PREFIX ex: <https://example.com/>
PREFIX aussies: <https://example.com/aussies/>
PREFIX aushapes: <https://example.com/aushapes/>
PREFIX dash: <http://datashapes.org/dash#>
PREFIX schema: <https://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
aussies:Holger
  a schema:Person ;
  schema:givenName "Holger" ;
  schema:familyName "Knublach" ;
  ex:isMarried true ;
  schema:address aussies:HolgersAddress .

aussies:HolgersAddress
  a schema:PostalAddress ;
  schema:streetAddress "3 Teewah Close" ;
  schema:addressLocality "Kewarra Beach" ;
  schema:addressRegion "QLD" ;
  schema:postalCode "4879" ;
  schema:email "holger@knublauch.com" ;
  schema:email "holger@topquadrant.com" ;
  rdfs:label "Holger's Address" .
      `
      shaclUpdated.value = true
      dataUpdated.value = true
    }
  },
  {
    label: 'CatPrez Record',
    command: () => {
      shacl.value = `\
PREFIX gswa: <https://example.com/gswa/>
PREFIX dash: <http://datashapes.org/dash#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX idnth: <https://data.idnau.org/pid/vocab/idn-th/>
PREFIX idnroles: <https://data.idnau.org/pid/vocab/idn-role-codes/>
PREFIX isoroles: <https://linked.data.gov.au/def/data-roles/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sdo: <https://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

dcat:Catalog
    a
        rdfs:Class ,
        sh:NodeShape ;
    rdfs:label "Catalog" ;
    sh:property
        [
            sh:datatype xsd:token ;
            sh:group <urn:group:citation> ;
            sh:path dcterms:identifier
        ] ,
        [
            sh:datatype rdf:langString ;
            sh:group <urn:group:citation> ;
            sh:path dcterms:title
        ] ,
        [
            sh:datatype rdf:langString ;
            sh:group <urn:group:citation> ;
            sh:path gswa:jurisdiction ;
        ] ,
        [
            dash:editor dash:TextAreaEditor ;
            sh:datatype rdf:langString ;
            sh:group <urn:group:description> ;
            sh:path dcterms:abstract
        ] ;
.

<urn:group:description>
    a sh:PropertyGroup ;
    rdfs:label "Description" ;
    sh:order 1 ;
.

<urn:group:citation>
    a sh:PropertyGroup ;
    rdfs:label "Citation" ;
    sh:order 0 ;
.
`
      data.value = `\
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

<https://data.idnau.org/pid/system/catprez> a dcat:Catalog ;
dcterms:identifier "c"^^xsd:string,
    "catprez"^^xsd:token ;
dcterms:title "CatPrez System Catalogue",
    "CatPrez System Catalogue in English"@en ;
prov:qualifiedAttribution [ a prov:Attribution ;
        dcat:hadRole isoroles:author,
            isoroles:custodian,
            isoroles:owner ;
        prov:agent <https://orcid.org/0000-0002-8742-7730> ] .
      `
      shaclUpdated.value = true
      dataUpdated.value = true
    }
  }
])

watch(shui, () => {
  if (!shaclUpdated.value && !dataUpdated.value) {
    data.value = shui.value.quadsToString(namedNode('urn:graph:data'))
  }
})
</script>

<template>
  <Button
    label="Examples"
    @click="(event: Event) => examplesMenu.toggle(event)"
    aria-haspopup="true"
    aria-controls="examples_menu"
  />
  <Menu ref="examplesMenu" id="examples_menu" :model="exampleItems" popup />
  <RDFTextarea
    label="SHACL Shapes"
    v-model="shacl"
    v-model:updated="shaclUpdated"
    graph="urn:system:graph:shacl"
  />
  <RDFTextarea label="Data" v-model="data" v-model:updated="dataUpdated" graph="urn:graph:data" />
</template>
