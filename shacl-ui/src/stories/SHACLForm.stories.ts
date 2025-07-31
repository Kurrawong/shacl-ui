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
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX schema: <https://schema.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      <https://example.com/fruits>
        a skos:ConceptScheme ;
        skos:prefLabel "Fruits" ;
        skos:alternateLabel "Fruits"@en ;
        skos:alternateLabel "水果"@zh ;
        skos:definition "A fruits vocabulary" ;
        schema:dateCreated "2025-07-14"^^xsd:date ;
        owl:versionIRI <https://example.com/fruits/1.0.0> ;
        owl:versionInfo "1.0.0" ;
        skos:historyNote "This is the first version of the fruits vocabulary." ;
        schema:publisher "John Doe" ;
        schema:status <https://linked.data.gov.au/def/reg-statuses/experimental> ;
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
              <alternateLabel>,
              [
                  sh:path rdfs:comment ;
                  sh:datatype xsd:string ;
                  sh:group <Annotation-group> ;
              ],
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
          sh:property [
            sh:path schema:isAccessibleForFree ;
            sh:datatype xsd:boolean ;
            sh:group <Annotation-group> ;
          ] ;
      .

      <Collection>
          a sh:NodeShape ;
          sh:targetClass skos:Collection ;
          sh:property <prefLabel>,
              <alternateLabel>,
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
              <alternateLabel>,
              <definition> ;
      .

      <prefLabel>
          a sh:PropertyShape ;
          sh:name "preferred label" ;
          sh:message "Requirement 2.1.4, 2.2.1 or 2.3.1 Each vocabulary, Collection or Concept MUST have exactly one title and at least one definition indicated using the skos:prefLabel and the skos:definition predicates respectively that must give textual literal values. Only one definition per language is allowed" ;
          dash:singleLine true ;
          dash:propertyRole dash:LabelRole ;
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

      <alternateLabel>
          a sh:PropertyShape ;
          sh:path skos:alternateLabel ;
          sh:uniqueLang true ;
          sh:group <Annotation-group> ;
          sh:order 1 ;
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

export const NoShapes: Story = {
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
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX schema: <https://schema.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      <https://example.com/fruits>
        a skos:ConceptScheme ;
        skos:prefLabel "Fruits" ;
        skos:alternateLabel "Fruits"@en ;
        skos:alternateLabel "水果"@zh ;
        skos:definition "A fruits vocabulary" ;
        schema:dateCreated "2025-07-14"^^xsd:date ;
        owl:versionIRI <https://example.com/fruits/1.0.0> ;
        owl:versionInfo "1.0.0" ;
        skos:historyNote "This is the first version of the fruits vocabulary." ;
        schema:publisher "John Doe" ;
        schema:status <https://linked.data.gov.au/def/reg-statuses/experimental> ;
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

    `,

    nodeShape: null,
    isRootNode: true,
  },
}

export const DCAT: Story = {
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
    focusNode: 'https://example.com/C1F424F2-DAA2-40BD-8B28-A3B9D7851E17' as any,

    dataGraph: `
      PREFIX : <https://example.com/>
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
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

:data-catalog a sdo:DataCatalog ;
    sdo:name "Department of Energy, Mines, Industry Regulation and Safety Data and Software centre"@en ;
.

<https://linked.data.gov.au/org/gswa> a sdo:Organization ;
    sdo:name "Geological Survey of Western Australia"@en ;
.

:C1F424F2-DAA2-40BD-8B28-A3B9D7851E17 a sdo:Dataset ;
    sdo:includeInDataCatalog :data-catalog ;
    # title
    sdo:name "1:500 000 State regolith geology of Western Australia"@en ;
    sdo:identifier "C1F424F2-DAA2-40BD-8B28-A3B9D7851E17"^^xsd:token ;
    # abstract
    sdo:abstract "The digital ‘1:500 000 State regolith geology of Western Australia’ is a compilation of existing Geological Survey of Western Australia (GSWA) regolith and surface geology maps. This product supersedes the 1:500 000 State regolith map (Marnham and Morris, 2003). Whereas the 2003 regolith map was largely a synthesis from 1:250 000 map sources, was partly generated by manual drawing and only used generic regolith codes, this new product incorporates all regolith coverage available at 1:100 000 scale, uses a revised regolith classification scheme, and was compiled using an automated algorithm for polygon generalization. Regolith geology from 1:100 000 and 1:250 000 scale maps has been compiled to produce a seamless digital regolith coverage. To produce a compilation readable at 1:500 000 scale, polygon line work had to be modified. The modification included aggregation of small polygons clusters with the same code into larger shapes, elimination of microfeatures, and simplification of polygon contours using the cellular automata (CA) model of the GeoScaler python script for ArcGIS (Huot-Vézina et al., 2012). Following this step, manual editing was required during edge fitting and topology cleaning to improve the polygon line work to comply with GSWA cartographic scale standards. The coding of regolith units in the layer follows GSWA’s regolith classification scheme (GSWA, 2013) with the addition of a suffix representing major physiographic province subdivisions across the State. Earlier maps that did not conform to the current scheme were recoded accordingly. Regolith codes consist of three parts: primary code (landform and landform qualifier), secondary code (compositional information), and physiographic province (major physiographic subdivisions across the State based on Pain et al. (2011)). For the scale of this product, tertiary codes (parent rock or cement) were deemed to be too detailed and were therefore rolled up into higher level codes. Regolith units are assigned to 11 landforms. They comprise areas of outcrop (_X, including bedrock and weathered rock), residual or relict material (_R, representing in situ regolith or remnants deposits from an earlier landscape), and nine transported units: _C, colluvium; _W, sheetwash; _A, alluvial/fluvial; _L, lacustrine; _E, eolian; _S, sandplain; _B, coastal (wave-dominated); _T, coastal (tide-dominated); and _M, marine. Suffixes used for the physiographic provinces are as follows: CAP, Central Australian Ranges Physiographic Province; KIP, Kimberley Physiographic Province; NAP, North Australian Plateaus Physiographic Province; NPP, Nullarbor Plain Physiographic Province; PIP, Pilbara Physiographic Province; SAP, Sandland Physiographic Province; TPP, Barkly–Tanami Plains Physiographic Province; WCP, Western Coastlands Physiographic Province; and YPP, Yilgarn Plateau Physiographic Province. Data are held in GDA 94 decimal degrees. REFERENCES: Geological Survey of Western Australia 2013, Revised classification system for regolith in Western Australia, and the recommended approach to regolith mapping: Geological Survey of Western Australia, Record 2013/7, 26p. | Huot-Vézina, G, Boivin, R, Smirnoff, A and Paradis, SJ, 2012, Geoscaler: Generalization tool: Geological Survey of Canada, Open File 6231, 2nd edition, DOI:10.4095/291993 | Marnham, J and Morris, PA 2003, A seamless digital regolith map of Western Australia: a potential resource for mineral exploration and environmental management: Western Australia Geological Survey, Annual Review 2002–03, p. 27–33 | Pain, C, Gregory, L, Wilson, P and McKenzie, N 2011, The physiographic regions of Australia – Explanatory notes 2011, Australian Collaborative Land Evaluation Program and National Committee on Soil and Terrains."@en ;
    # search words
    sdo:keywords <https://linked.data.gov.au/def/GSWA-vocabulary-themesgeology>,
        <https://linked.data.gov.au/def/GSWA-vocabulary-themesresources-energy>,
        <https://linked.data.gov.au/def/GSWA-vocabulary-themesresources-mineral> ;
    sdo:publisher <https://linked.data.gov.au/org/gswa> ;
    # reference system
    gswa:crs <https://epsg.io/4283> ;
    # publication date
    sdo:datePublished "2020-02-21"^^xsd:date ;
    # metadata date
    sdo:dateModified "2023-05-15"^^xsd:date ;
    # derived from status as ongoing and the creation date
    sdo:temporalCoverage "2017-02-17/.." ;
    # geographic extent polygon
    sdo:spatialCoverage [
        sdo:geo [
            sdo:box "[-35.50 112.50], [-35.50 129.00], [-13.50 129.00], [-13.50 112.50]" ;
        ] ;
    ] ;
    # status
    sdo:status gswa-status:ongoing ;
    # maintenance and update
    sdo:repeatFrequency freq:weekly ;

    #
    # Data Quality
    #
    gswa:lineage "Sources for the ‘1:500 000 State regolith geology of Western Australia’ are published GSWA Geological Information Series (GIS) packages that include digital 1:100 000 and 1:250 000 regolith and/or surface geology. The highest levels of reliability are in areas of 1:100 000 and 1:250 000 regolith-only maps, and 1:100 000 surface geology maps. These maps cover most of the southwestern Capricorn Orogen and the Nicholls 1:100 000 sheet from the eastern Capricorn Orogen; most of Pilbara Craton and Paterson Orogen; the Tanami–Arunta region; the Kimberley Basin and Halls Creek Orogen; the west Musgrave Province; and Yilgarn Craton. The minimum area, length and width of geological polygons conform to GSWA’s standards for 1:500 000 scale maps. For performance purposes, large polygons have been split along the boundaries of 1:250 000 tiles, creating long linear lines in the map. This does not affect the interpretation of regolith geology. The nomenclature and hierarchy for the regolith units are based on weekly updates from the Explanatory Notes System (ENS), a database that incorporates a seamless, current summary of the regolith, bedrock, tectonic units, and events of Western Australia."@en ;
    gswa:positionalAccuracy "This layer has been optimized for display at the nominal scale; viewing at smaller scales will degrade resolution, whereas larger scales will degrade accuracy. The layer has been compiled from maps based on different geodetic systems (Clarke 1858, AGD66 and AGD84). Map boundary alignment has been corrected manually; however, there may still be some misalignment between polygons in the layer and current satellite images."@en ;
    gswa:attributeAccuracy "Accuracy of attribute information in this dataset is estimated at 95%. Attribute conversion of historical classifications in some regions may contain minor inconsistencies due to generalization of units and merging of polygons."@en ;
    gswa:logicalConsistency "Data were visually compared with published maps to check capture and attribution. Minor inconsistency of edge matching may be present along data source boundaries with conflicting classifications."@en ;
    gswa:completeness "This edition is complete and has been verified"@en ;
    gswa:credit "Geological Survey of Western Australia 2020, 1:500 000 State regolith geology of Western Australia: Geological Survey of Western Australia, digital data layer, <www.dmp.wa.gov.au/geoview>. Compilers of geology: S Jakica and N de Souza Kovacs Compilers GIS: IMT Granado and J Hogen-Esch"@en ;

    #
    # Contact
    #

    # contact information
    prov:qualifiedAttribution [
        prov:hadRole gswa-roles:digital-data-admin ;
        prov:agent [
            sdo:name "Digital Data Administrator"@en ;
            sdo:contactPoint [
                sdo:contactType "contact information" ;
                sdo:telephone "(08) 9222 3816" ;
                sdo:email "gsd.dda@dmirs.wa.gov.au" ;
            ] ;
            sdo:address [
                sdo:streetAddress "Department of Mines, Industry Regulation and Safety - Geological Survey and Resource Strategy Division 100 Plain Street" ;
                sdo:addressLocality "East Perth" ;
                sdo:addressRegion "Western Australia" ;
                sdo:postalCode "6004" ;
            ] ;
        ] ;
    ] ;

    # resource contact information
    prov:qualifiedAttribution [
        prov:hadRole gswa-roles:chief-geoscientist ;
        prov:agent [
            sdo:name "Chief Geoscientist"@en ;
            sdo:contactPoint [
                sdo:contactType "contact information" ;
                sdo:telephone "(08) 9222 3816" ;
                sdo:email "gsd.dda@dmirs.wa.gov.au" ;
            ] ;
            sdo:address [
                sdo:streetAddress "Department of Mines, Industry Regulation and Safety - Geological Survey and Resource Strategy Division 100 Plain Street" ;
                sdo:addressLocality "East Perth" ;
                sdo:addressRegion "Western Australia" ;
                sdo:postalCode "6004" ;
            ] ;
        ] ;
    ] ;
.
    `,

    shapesGraph: `
PREFIX : <https://example.com/>
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
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

#
# DataCatalog NodeShape
#
gswa-shapes:DataCatalog a sh:NodeShape ;
    rdfs:label "Data Catalog" ;
    sh:targetClass sdo:DataCatalog ;
    sh:property gswa-shapes:DataCatalog-name ;
    sh:property gswa-shapes:DataCatalog-identifier ;
.

gswa-shapes:DataCatalog-name a sh:PropertyShape ;
    sh:name "Title" ;
    sh:path sdo:name ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype rdf:langString ;
    dash:propertyRole dash:LabelRole ;
    sh:order 0 ;
.

gswa-shapes:DataCatalog-identifier a sh:PropertyShape ;
    sh:name "Unique ID" ;
    sh:path sdo:identifier ;
    sh:datatype xsd:token ;
    sh:order 1 ;
.

#
# Dataset NodeShape
#
gswa-shapes:Dataset a sh:NodeShape ;
    rdfs:label "Dataset" ;
    sh:targetClass sdo:Dataset ;
    sh:property [
      sh:path sdo:isAccessibleForFree ;
      sh:datatype xsd:boolean ;
      sh:group gswa-shapes:Dataset-metadata-group ;
    ] ;
    sh:property gswa-shapes:Dataset-name ;
    sh:property gswa-shapes:Dataset-identifier ;
    sh:property gswa-shapes:Dataset-abstract ;
    sh:property gswa-shapes:Dataset-keywords ;
    sh:property gswa-shapes:Dataset-publisher ;
    sh:property gswa-shapes:Dataset-crs ;
    sh:property gswa-shapes:Dataset-datePublished ;
    sh:property gswa-shapes:Dataset-dateModified ;
    sh:property gswa-shapes:Dataset-temporalCoverage ;
    sh:property gswa-shapes:Dataset-spatialCoverage ;
    sh:property gswa-shapes:Dataset-status ;
    sh:property gswa-shapes:Dataset-repeatFrequency ;
    sh:property gswa-shapes:Dataset-includeInDataCatalog ;
    sh:property gswa-shapes:Dataset-lineage ;
    sh:property gswa-shapes:Dataset-positionalAccuracy ;
    sh:property gswa-shapes:Dataset-attributeAccuracy ;
    sh:property gswa-shapes:Dataset-logicalConsistency ;
    sh:property gswa-shapes:Dataset-completeness ;
    sh:property gswa-shapes:Dataset-credit ;
    sh:property gswa-shapes:Dataset-qualifiedAttribution ;
.

#
# PropertyShapes in the Metadata group
#
gswa-shapes:Dataset-name a sh:PropertyShape ;
    sh:name "Title" ;
    sh:path sdo:name ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype rdf:langString ;
    dash:propertyRole dash:LabelRole ;
    sh:order 0 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-identifier a sh:PropertyShape ;
    sh:name "Unique ID" ;
    sh:path sdo:identifier ;
    sh:datatype xsd:token ;
    dash:singleLine true ;
    sh:order 1 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-abstract a sh:PropertyShape ;
    sh:name "Abstract" ;
    sh:path sdo:abstract ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:order 2 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-keywords a sh:PropertyShape ;
    sh:name "Search Words" ;
    sh:path sdo:keywords ;
    sh:class skos:Concept ;
    sh:node [
        sh:property [
            sh:path skos:inScheme ;
            sh:hasValue <https://linked.data.gov.au/def/GSWA-vocabulary-themes> ;
        ]
    ] ;
    sh:order 3 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-publisher a sh:PropertyShape ;
    sh:name "Publisher" ;
    sh:path sdo:publisher ;
    sh:class sdo:Organization ;
    sh:order 4 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-datePublished a sh:PropertyShape ;
    sh:name "Publication Date" ;
    sh:path sdo:datePublished ;
    sh:datatype xsd:date ;
    sh:maxCount 1 ;
    sh:order 6 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-dateModified a sh:PropertyShape ;
    sh:name "Metadata Date" ;
    sh:path sdo:dateModified ;
    sh:datatype xsd:date ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:order 7 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-status a sh:PropertyShape ;
    sh:name "Status" ;
    sh:path sdo:status ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:class skos:Concept ;
    sh:node [
        sh:property [
            sh:path skos:inScheme ;
            sh:hasValue gswa-status-cc: ;
        ]
    ] ;
    sh:order 8 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-repeatFrequency a sh:PropertyShape ;
    sh:name "Maintenance and Update" ;
    sh:path sdo:repeatFrequency ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:class skos:Concept ;
    sh:node [
        sh:property [
            sh:path skos:inScheme ;
            sh:hasValue <http://purl.org/cld/freq> ;
        ]
    ] ;
    sh:order 8 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

gswa-shapes:Dataset-includeInDataCatalog a sh:PropertyShape ;
    sh:name "In Data Catalog" ;
    sh:path sdo:includeInDataCatalog ;
    sh:minCount 1 ;
    sh:class sdo:DataCatalog ;
    sh:order 9 ;
    sh:group gswa-shapes:Dataset-metadata-group ;
.

#
# PropertyShapes in the Coverage group
#
gswa-shapes:Dataset-temporalCoverage a sh:PropertyShape ;
    sh:name "Temporal Coverage" ;
    sh:path sdo:temporalCoverage ;
    sh:datatype xsd:string ;
    # TODO: regex validation with sh:pattern
    sh:maxCount 1 ;
    sh:order 0 ;
    sh:group gswa-shapes:Dataset-coverage-group ;
.

gswa-shapes:Dataset-crs a sh:PropertyShape ;
    sh:name "Coordinate Reference System" ;
    sh:path gswa:crs ;
    sh:class skos:Concept ;
    sh:maxCount 1 ;
    sh:node [
        sh:property [
            sh:path skos:inScheme ;
            sh:hasValue gswa-epsg-cc: ;
        ] ;
    ] ;
    sh:order 1 ;
    sh:group gswa-shapes:Dataset-coverage-group ;
.

gswa-shapes:Dataset-spatialCoverage a sh:PropertyShape ;
    sh:name "Spatial Coverage" ;
    sh:path sdo:spatialCoverage ;
    sh:maxCount 1 ;
    sh:nodeKind sh:BlankNode ;
    # TODO: potentially a map editor can be used here too
    dash:editor dash:DetailsEditor ;
    sh:node [
        sh:property [
            sh:name "Geometry" ;
            sh:path sdo:geo ;
            sh:minCount 1 ;
            sh:maxCount 1 ;
            sh:nodeKind sh:BlankNode ;
            dash:editor dash:DetailsEditor ;
            sh:node [
                sh:property [
                    sh:name "Box" ;
                    sh:path sdo:box ;
                    sh:datatype xsd:string ;
                    sh:minCount 1 ;
                    sh:maxCount 1 ;
                ] ;
            ] ;
        ] ;
    ] ;
    sh:order 2 ;
    sh:group gswa-shapes:Dataset-coverage-group ;
.

#
# PropertyShapes in the Data Quality group
#
gswa-shapes:Dataset-lineage a sh:PropertyShape ;
    sh:name "Lineage" ;
    sh:path gswa:lineage ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:maxCount 1 ;
    sh:order 0 ;
    sh:group gswa-shapes:Dataset-data-quality-group ;
.

gswa-shapes:Dataset-positionalAccuracy a sh:PropertyShape ;
    sh:name "Positional Accuracy" ;
    sh:path gswa:positionalAccuracy ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:maxCount 1 ;
    sh:order 1 ;
    sh:group gswa-shapes:Dataset-data-quality-group ;
.

gswa-shapes:Dataset-attributeAccuracy a sh:PropertyShape ;
    sh:name "Attribute Accuracy" ;
    sh:path gswa:attributeAccuracy ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:maxCount 1 ;
    sh:order 2 ;
    sh:group gswa-shapes:Dataset-data-quality-group ;
.

gswa-shapes:Dataset-logicalConsistency a sh:PropertyShape ;
    sh:name "Logical Consistency" ;
    sh:path gswa:logicalConsistency ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:maxCount 1 ;
    sh:order 3 ;
    sh:group gswa-shapes:Dataset-data-quality-group ;
.

gswa-shapes:Dataset-completeness a sh:PropertyShape ;
    sh:name "Completeness" ;
    sh:path gswa:completeness ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:maxCount 1 ;
    sh:order 4 ;
    sh:group gswa-shapes:Dataset-data-quality-group ;
.

gswa-shapes:Dataset-credit a sh:PropertyShape ;
    sh:name "Credit" ;
    sh:path gswa:credit ;
    sh:datatype rdf:langString ;
    dash:singleLine false ;
    sh:maxCount 1 ;
    sh:order 5 ;
    sh:group gswa-shapes:Dataset-data-quality-group ;
.

#
# PropertyShapes in the Contact group
#
gswa-shapes:Dataset-qualifiedAttribution a sh:PropertyShape ;
    sh:name "Contact Person" ;
    sh:path prov:qualifiedAttribution ;
    sh:nodeKind sh:BlankNode ;
    dash:editor dash:DetailsEditor ;
    sh:order 0 ;
    sh:group gswa-shapes:Dataset-contact-group ;
    sh:node [
        sh:property [
            sh:name "Role" ;
            sh:path prov:hadRole ;
            sh:class skos:Concept ;
            sh:minCount 1 ;
            sh:maxCount 1 ;
            sh:node [
                sh:property [
                    sh:path skos:inScheme ;
                    sh:hasValue gswa-roles-cc: ;
                ] ;
            ] ;
            sh:order 0 ;
        ] ;
        sh:property [
            sh:name "Contact Information" ;
            sh:path prov:agent ;
            sh:minCount 1 ;
            sh:maxCount 1 ;
            dash:editor dash:DetailsEditor ;
            sh:node [
                sh:property [
                    sh:name "Name" ;
                    sh:path sdo:name ;
                    dash:propertyRole dash:LabelRole ;
                    sh:minCount 1 ;
                    sh:maxCount 1 ;
                    sh:datatype xsd:string ;
                    sh:order 0 ;
                ] ;
                sh:property [
                    sh:name "Contact Point" ;
                    sh:path sdo:contactPoint ;
                    dash:editor dash:DetailsEditor ;
                    sh:node [
                        sh:property [
                            sh:name "Contact Type" ;
                            sh:path sdo:contactType ;
                            sh:datatype xsd:string ;
                            sh:maxCount 1 ;
                            sh:order 0 ;
                        ] ;
                        sh:property [
                            sh:name "Telephone" ;
                            sh:path sdo:telephone ;
                            sh:datatype xsd:string ;
                            sh:order 1 ;
                        ] ;
                        sh:property [
                            sh:name "Email" ;
                            sh:path sdo:email ;
                            sh:datatype xsd:string ;
                            sh:order 2 ;
                        ] ;
                    ] ;
                    sh:order 1 ;
                ] ;
                sh:property [
                    sh:name "Address" ;
                    sh:path sdo:address ;
                    dash:editor dash:DetailsEditor ;
                    sh:node [
                        sh:property [
                            sh:name "Street" ;
                            sh:path sdo:streetAddress ;
                            sh:minCount 1 ;
                            sh:maxCount 1 ;
                            sh:datatype xsd:string ;
                            sh:order 0 ;
                        ] ;
                        sh:property [
                            sh:name "Suburb" ;
                            sh:path sdo:addressLocality ;
                            sh:minCount 1 ;
                            sh:maxCount 1 ;
                            sh:datatype xsd:string ;
                            sh:order 1 ;
                        ] ;
                        sh:property [
                            sh:name "State or Territory" ;
                            sh:path sdo:addressRegion ;
                            sh:minCount 1 ;
                            sh:maxCount 1 ;
                            sh:datatype xsd:string ;
                            sh:order 2 ;
                        ] ;
                        sh:property [
                            sh:name "Postcode" ;
                            sh:path sdo:postalCode ;
                            sh:minCount 1 ;
                            sh:maxCount 1 ;
                            sh:datatype xsd:string ;
                            sh:order 3 ;
                        ] ;
                    ] ;
                    sh:order 2 ;
                ] ;
            ] ;
            sh:order 1 ;
        ] ;
    ] ;
.

#
# Dataset PropertyGroups
#
gswa-shapes:Dataset-metadata-group a sh:PropertyGroup ;
    rdfs:label "Metadata" ;
    sh:order 0 ;
.

gswa-shapes:Dataset-coverage-group a sh:PropertyGroup ;
    rdfs:label "Temporal and Spatial Coverage" ;
    sh:order 1 ;
.

gswa-shapes:Dataset-data-quality-group a sh:PropertyGroup ;
    rdfs:label "Data Quality" ;
    sh:order 2 ;
.
gswa-shapes:Dataset-contact-group a sh:PropertyGroup ;
    rdfs:label "Contact" ;
    sh:order 3 ;
.
    `,

    nodeShape: 'https://example.com/gswa/shapes/Dataset' as any,
    isRootNode: true,
  },
}

export const VocPub: Story = {
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
    focusNode: 'http://linked.data.gov.au/def/data-access-rights' as any,

    dataGraph: `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sdo: <https://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

PREFIX da: <http://linked.data.gov.au/def/data-access-rights/>

<http://linked.data.gov.au/def/data-access-rights> a owl:Ontology , skos:ConceptScheme ;
    skos:prefLabel "Data Access Rights"@en ;
    skos:definition "Data access rights control how users and systems access a data resource."@en ;
    skos:historyNote "This vocabulary is taken from the COAR Controlled Vocabularies Interest Group (http://vocabularies.coar-repositories.org/documentation/access_rights/) but is redelivered as that vocabulary isn't well presented online."@en ;
    dcterms:source "http://vocabularies.coar-repositories.org/documentation/access_rights/"^^xsd:anyURI ;
    dcterms:creator <http://linked.data.gov.au/org/gsq> ;
    dcterms:created "2019-04-03"^^xsd:date ;
    dcterms:modified "2019-09-10"^^xsd:date ;
    dcterms:publisher <http://linked.data.gov.au/org/gsq> ;
    skos:hasTopConcept da:open , da:restricted ;
.

<http://linked.data.gov.au/org/gsq> a sdo:Organization ;
    sdo:name "Geological Survey of Queensland" ;
    sdo:url "https://www.business.qld.gov.au/industries/mining-energy-water/resources/geoscience-information/gsq"^^xsd:anyURI .

da:embargoed a skos:Concept ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    skos:prefLabel "Embargoed access"@en ;
    skos:definition "Embargoed access refers to a resource accessible as metadata only until released for open access on a specified date."@en ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
    skos:broader da:protected ;
    dcterms:provenance "Same origin as the whole vocabulary" ;
.

da:metadata-only a skos:Concept ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    skos:prefLabel "Metadata only access"@en ;
    skos:definition "Metadata only access refers to a resource in which access is limited to metadata only. Access to the resource requires granting of access rights."@en ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
    skos:broader da:protected ;
    dcterms:provenance "Same origin as the whole vocabulary" ;
.

da:open a skos:Concept ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    skos:prefLabel "Open access"@en ;
    skos:altLabel "Open file"@en ;
    skos:definition "Open access refers to a resource that is immediately and permanently online, and free for all on the Web, without financial and technical barriers."@en ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
    skos:topConceptOf <http://linked.data.gov.au/def/data-access-rights> ;
    dcterms:provenance "Same origin as the whole vocabulary" ;
.

da:restricted a skos:Concept ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    skos:prefLabel "Restricted access"@en ;
    skos:definition "Restricted access refers to a resource that is stored in a system but is not freely accessible. Access is limited to specific personnel or user groups."@en ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
    skos:topConceptOf <http://linked.data.gov.au/def/data-access-rights> ;
    dcterms:provenance "Same origin as the whole vocabulary" ;
.

da:protected a skos:Concept ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    skos:prefLabel "Protected access"@en ;
    skos:definition "Protected access refers to a resource that is stored in a system but is not freely accessible due to specific legal or policy decisions, such as active legal proceedings or ministerial discretion. Access is limited to specific personnel or user groups. "@en ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
    skos:broader da:protected ;
    dcterms:provenance "Same origin as the whole vocabulary" ;
.

da:open-access-rights a skos:Collection ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    dcterms:provenance "Created in this vocabulary" ;
    skos:prefLabel "Open data access rights"@en ;
    skos:definition "Data that is non-sensitive, freely available, easily discovered and accessed, and published in ways and with licences that allow easy reuse."@en ;
    skos:member da:open ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
.

da:closed-access-rights a skos:Collection ;
    rdfs:isDefinedBy <http://linked.data.gov.au/def/data-access-rights> ;
    dcterms:provenance "Created in this vocabulary" ;
    skos:prefLabel "Closed data access rights"@en ;
    skos:definition "Selective restriction of access to data that is OFFICIAL (low or negligible confidentiality impact), SENSITIVE (moderate confidentiality impact) or PROTECTED (high confidentiality impact)."@en ;
    skos:member da:embargoed,
        da:metadata-only,
        da:protected,
        da:restricted ;
    skos:inScheme <http://linked.data.gov.au/def/data-access-rights> ;
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
          sh:property	<prefLabel>,
              <definition>,
              <alternateLabel>,
              [
                  sh:path rdfs:comment ;
                  sh:datatype xsd:string ;
                  sh:group <Annotation-group> ;
              ],
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
          sh:property [
            sh:path schema:isAccessibleForFree ;
            sh:datatype xsd:boolean ;
            sh:group <Annotation-group> ;
          ] ;
      .

      <Collection>
          a sh:NodeShape ;
          sh:targetClass skos:Collection ;
          sh:property <prefLabel>,
              <alternateLabel>,
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
              <alternateLabel>,
              <definition> ;
      .

      <prefLabel>
          a sh:PropertyShape ;
          sh:name "preferred label" ;
          sh:message "Requirement 2.1.4, 2.2.1 or 2.3.1 Each vocabulary, Collection or Concept MUST have exactly one title and at least one definition indicated using the skos:prefLabel and the skos:definition predicates respectively that must give textual literal values. Only one definition per language is allowed" ;
          dash:singleLine true ;
          dash:propertyRole dash:LabelRole ;
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

      <alternateLabel>
          a sh:PropertyShape ;
          sh:path skos:alternateLabel ;
          sh:uniqueLang true ;
          sh:group <Annotation-group> ;
          sh:order 1 ;
      .

      <definition>
          a sh:PropertyShape ;
          sh:message "Requirement 2.1.4, 2.2.1 or 2.3.1 Each vocabulary, Collection or Concept MUST have exactly one title and at least one definition indicated using the skos:prefLabel and the skos:definition predicates respectively that must give textual literal values. Only one definition per language is allowed" ;
          sh:path skos:definition ;
          sh:minCount 1 ;
          sh:uniqueLang true ;
          dash:singleLine false ;
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
