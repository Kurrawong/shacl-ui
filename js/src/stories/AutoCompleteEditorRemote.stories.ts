import type { Meta, StoryObj } from '@storybook/vue3'
import AutoCompleteEditorRemote from '@/components/dash/editors/AutoCompleteEditorRemote.vue'
import { DataFactory, Parser } from 'n3'
import namedNode = DataFactory.namedNode
import { useShui } from '@/composables/shui'
import { h } from 'vue'

const { shui, addQuads, reset, setSparqlUrl } = useShui()

const focusNode = namedNode('https://example.com/C1F424F2-DAA2-40BD-8B28-A3B9D7851E17')
const dataGraph = namedNode('urn:graph:catalogs')
const nodeShape = namedNode('https://example.com/gswa/shapes/Dataset')

function loadData() {
  const parser = new Parser()
  const dataQuads = parser.parse(`
    <urn:graph:catalogs> {
    <https://example.com/C1F424F2-DAA2-40BD-8B28-A3B9D7851E17>
          a                               <https://schema.org/Dataset>;
          <http://www.w3.org/ns/prov#qualifiedAttribution>
                  [ <http://www.w3.org/ns/prov#agent>
                            [ <https://schema.org/address>  [ <https://schema.org/addressLocality>
                                                                      "East Perth";
                                                              <https://schema.org/addressRegion>
                                                                      "Western Australia";
                                                              <https://schema.org/postalCode>
                                                                      "6004";
                                                              <https://schema.org/streetAddress>
                                                                      "Department of Mines, Industry Regulation and Safety - Geological Survey and Resource Strategy Division 100 Plain Street"
                                                            ];
                              <https://schema.org/contactPoint>
                                      [ <https://schema.org/contactType>
                                                "contact information";
                                        <https://schema.org/email>      "gsd.dda@dmirs.wa.gov.au";
                                        <https://schema.org/telephone>  "(08) 9222 3816"
                                      ];
                              <https://schema.org/name>     "Digital Data Administrator"@en
                            ];
                    <http://www.w3.org/ns/prov#hadRole>
                            <https://example.com/gswa/role/digital-data-admin>
                  ];
          <http://www.w3.org/ns/prov#qualifiedAttribution>
                  [ <http://www.w3.org/ns/prov#agent>
                            [ <https://schema.org/address>  [ <https://schema.org/addressLocality>
                                                                      "East Perth";
                                                              <https://schema.org/addressRegion>
                                                                      "Western Australia";
                                                              <https://schema.org/postalCode>
                                                                      "6004";
                                                              <https://schema.org/streetAddress>
                                                                      "Department of Mines, Industry Regulation and Safety - Geological Survey and Resource Strategy Division 100 Plain Street"
                                                            ];
                              <https://schema.org/contactPoint>
                                      [ <https://schema.org/contactType>
                                                "contact information";
                                        <https://schema.org/email>      "gsd.dda@dmirs.wa.gov.au";
                                        <https://schema.org/telephone>  "(08) 9222 3816"
                                      ];
                              <https://schema.org/name>     "Chief Geoscientist"@en
                            ];
                    <http://www.w3.org/ns/prov#hadRole>
                            <https://example.com/gswa/role/chief-geoscientist>
                  ];
          <https://example.com/gswa/data/attributeAccuracy>
                  "Accuracy of attribute information in this dataset is estimated at 95%. Attribute conversion of historical classifications in some regions may contain minor inconsistencies due to generalization of units and merging of polygons."@en;
          <https://example.com/gswa/data/completeness>
                  "This edition is complete and has been verified"@en;
          <https://example.com/gswa/data/credit>
                  "Geological Survey of Western Australia 2020, 1:500 000 State regolith geology of Western Australia: Geological Survey of Western Australia, digital data layer, <www.dmp.wa.gov.au/geoview>. Compilers of geology: S Jakica and N de Souza Kovacs Compilers GIS: IMT Granado and J Hogen-Esch"@en;
          <https://example.com/gswa/data/crs>
                  <https://epsg.io/4283>;
          <https://example.com/gswa/data/lineage>
                  "Sources for the ‘1:500 000 State regolith geology of Western Australia’ are published GSWA Geological Information Series (GIS) packages that include digital 1:100 000 and 1:250 000 regolith and/or surface geology. The highest levels of reliability are in areas of 1:100 000 and 1:250 000 regolith-only maps, and 1:100 000 surface geology maps. These maps cover most of the southwestern Capricorn Orogen and the Nicholls 1:100 000 sheet from the eastern Capricorn Orogen; most of Pilbara Craton and Paterson Orogen; the Tanami–Arunta region; the Kimberley Basin and Halls Creek Orogen; the west Musgrave Province; and Yilgarn Craton. The minimum area, length and width of geological polygons conform to GSWA’s standards for 1:500 000 scale maps. For performance purposes, large polygons have been split along the boundaries of 1:250 000 tiles, creating long linear lines in the map. This does not affect the interpretation of regolith geology. The nomenclature and hierarchy for the regolith units are based on weekly updates from the Explanatory Notes System (ENS), a database that incorporates a seamless, current summary of the regolith, bedrock, tectonic units, and events of Western Australia."@en;
          <https://example.com/gswa/data/logicalConsistency>
                  "Data were visually compared with published maps to check capture and attribution. Minor inconsistency of edge matching may be present along data source boundaries with conflicting classifications."@en;
          <https://example.com/gswa/data/positionalAccuracy>
                  "This layer has been optimized for display at the nominal scale; viewing at smaller scales will degrade resolution, whereas larger scales will degrade accuracy. The layer has been compiled from maps based on different geodetic systems (Clarke 1858, AGD66 and AGD84). Map boundary alignment has been corrected manually; however, there may still be some misalignment between polygons in the layer and current satellite images."@en;
          <https://schema.org/abstract>   "The digital ‘1:500 000 State regolith geology of Western Australia’ is a compilation of existing Geological Survey of Western Australia (GSWA) regolith and surface geology maps. This product supersedes the 1:500 000 State regolith map (Marnham and Morris, 2003). Whereas the 2003 regolith map was largely a synthesis from 1:250 000 map sources, was partly generated by manual drawing and only used generic regolith codes, this new product incorporates all regolith coverage available at 1:100 000 scale, uses a revised regolith classification scheme, and was compiled using an automated algorithm for polygon generalization. Regolith geology from 1:100 000 and 1:250 000 scale maps has been compiled to produce a seamless digital regolith coverage. To produce a compilation readable at 1:500 000 scale, polygon line work had to be modified. The modification included aggregation of small polygons clusters with the same code into larger shapes, elimination of microfeatures, and simplification of polygon contours using the cellular automata (CA) model of the GeoScaler python script for ArcGIS (Huot-Vézina et al., 2012). Following this step, manual editing was required during edge fitting and topology cleaning to improve the polygon line work to comply with GSWA cartographic scale standards. The coding of regolith units in the layer follows GSWA’s regolith classification scheme (GSWA, 2013) with the addition of a suffix representing major physiographic province subdivisions across the State. Earlier maps that did not conform to the current scheme were recoded accordingly. Regolith codes consist of three parts: primary code (landform and landform qualifier), secondary code (compositional information), and physiographic province (major physiographic subdivisions across the State based on Pain et al. (2011)). For the scale of this product, tertiary codes (parent rock or cement) were deemed to be too detailed and were therefore rolled up into higher level codes. Regolith units are assigned to 11 landforms. They comprise areas of outcrop (_X, including bedrock and weathered rock), residual or relict material (_R, representing in situ regolith or remnants deposits from an earlier landscape), and nine transported units: _C, colluvium; _W, sheetwash; _A, alluvial/fluvial; _L, lacustrine; _E, eolian; _S, sandplain; _B, coastal (wave-dominated); _T, coastal (tide-dominated); and _M, marine. Suffixes used for the physiographic provinces are as follows: CAP, Central Australian Ranges Physiographic Province; KIP, Kimberley Physiographic Province; NAP, North Australian Plateaus Physiographic Province; NPP, Nullarbor Plain Physiographic Province; PIP, Pilbara Physiographic Province; SAP, Sandland Physiographic Province; TPP, Barkly–Tanami Plains Physiographic Province; WCP, Western Coastlands Physiographic Province; and YPP, Yilgarn Plateau Physiographic Province. Data are held in GDA 94 decimal degrees. REFERENCES: Geological Survey of Western Australia 2013, Revised classification system for regolith in Western Australia, and the recommended approach to regolith mapping: Geological Survey of Western Australia, Record 2013/7, 26p. | Huot-Vézina, G, Boivin, R, Smirnoff, A and Paradis, SJ, 2012, Geoscaler: Generalization tool: Geological Survey of Canada, Open File 6231, 2nd edition, DOI:10.4095/291993 | Marnham, J and Morris, PA 2003, A seamless digital regolith map of Western Australia: a potential resource for mineral exploration and environmental management: Western Australia Geological Survey, Annual Review 2002–03, p. 27–33 | Pain, C, Gregory, L, Wilson, P and McKenzie, N 2011, The physiographic regions of Australia – Explanatory notes 2011, Australian Collaborative Land Evaluation Program and National Committee on Soil and Terrains."@en;
          <https://schema.org/dateModified>
                  "2023-05-15"^^<http://www.w3.org/2001/XMLSchema#date>;
          <https://schema.org/datePublished>
                  "2020-02-21"^^<http://www.w3.org/2001/XMLSchema#date>;
          <https://schema.org/identifier>
                  "C1F424F2-DAA2-40BD-8B28-A3B9D7851E17"^^<http://www.w3.org/2001/XMLSchema#token>;
          <https://schema.org/includeInDataCatalog>
                  <https://example.com/data-catalog>;
          <https://schema.org/keywords>   <https://linked.data.gov.au/def/GSWA-vocabulary-themesgeology> , <https://linked.data.gov.au/def/GSWA-vocabulary-themesresources-energy> , <https://linked.data.gov.au/def/GSWA-vocabulary-themesresources-mineral>;
          <https://schema.org/name>       "1:500 000 State regolith geology of Western Australia"@en;
          <https://schema.org/publisher>  <https://linked.data.gov.au/org/gswa>;
          <https://schema.org/repeatFrequency>
                  <http://purl.org/cld/freq/weekly>;
          <https://schema.org/spatialCoverage>
                  [ <https://schema.org/geo>  [ <https://schema.org/box>
                                      "[-35.50 112.50], [-35.50 129.00], [-13.50 129.00], [-13.50 112.50]" ]
                  ];
          <https://schema.org/status>     <https://example.com/gswa/status/ongoing>;
          <https://schema.org/temporalCoverage>
                  "2017-02-17/.." .
  }
                  `)

  const shaclQuads = parser.parse(`
    @prefix dash: <http://datashapes.org/dash#> .
    @prefix ns1: <http://datashapes.org/dash#> .
    @prefix ns2: <http://www.w3.org/ns/shacl-x#> .
    @prefix prov: <http://www.w3.org/ns/prov#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix schema: <https://schema.org/> .
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix skos: <http://www.w3.org/2004/02/skos/core#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

  <urn:system:graph:shacl> {
    <https://example.com/gswa/shapes/Dataset> a sh:NodeShape ;
        rdfs:label "Dataset" ;
        sh:property <https://example.com/gswa/shapes/Dataset-abstract>,
            <https://example.com/gswa/shapes/Dataset-attributeAccuracy>,
            <https://example.com/gswa/shapes/Dataset-completeness>,
            <https://example.com/gswa/shapes/Dataset-credit>,
            <https://example.com/gswa/shapes/Dataset-crs>,
            <https://example.com/gswa/shapes/Dataset-dateModified>,
            <https://example.com/gswa/shapes/Dataset-datePublished>,
            <https://example.com/gswa/shapes/Dataset-identifier>,
            <https://example.com/gswa/shapes/Dataset-includeInDataCatalog>,
            <https://example.com/gswa/shapes/Dataset-keywords>,
            <https://example.com/gswa/shapes/Dataset-lineage>,
            <https://example.com/gswa/shapes/Dataset-logicalConsistency>,
            <https://example.com/gswa/shapes/Dataset-name>,
            <https://example.com/gswa/shapes/Dataset-positionalAccuracy>,
            <https://example.com/gswa/shapes/Dataset-publisher>,
            <https://example.com/gswa/shapes/Dataset-qualifiedAttribution>,
            <https://example.com/gswa/shapes/Dataset-repeatFrequency>,
            <https://example.com/gswa/shapes/Dataset-spatialCoverage>,
            <https://example.com/gswa/shapes/Dataset-status>,
            <https://example.com/gswa/shapes/Dataset-temporalCoverage> ;
        sh:targetClass schema:Dataset .

    <https://example.com/gswa/shapes/Dataset-abstract> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:maxCount 1 ;
        sh:minCount 1 ;
        sh:name "Abstract" ;
        sh:order 2 ;
        sh:path schema:abstract .

    <https://example.com/gswa/shapes/Dataset-attributeAccuracy> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-data-quality-group> ;
        sh:maxCount 1 ;
        sh:name "Attribute Accuracy" ;
        sh:order 2 ;
        sh:path <https://example.com/gswa/data/attributeAccuracy> .

    <https://example.com/gswa/shapes/Dataset-completeness> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-data-quality-group> ;
        sh:maxCount 1 ;
        sh:name "Completeness" ;
        sh:order 4 ;
        sh:path <https://example.com/gswa/data/completeness> .

    <https://example.com/gswa/shapes/Dataset-contact-group> a sh:PropertyGroup ;
        rdfs:label "Contact" ;
        sh:order 3 .

    <https://example.com/gswa/shapes/Dataset-credit> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-data-quality-group> ;
        sh:maxCount 1 ;
        sh:name "Credit" ;
        sh:order 5 ;
        sh:path <https://example.com/gswa/data/credit> .

    <https://example.com/gswa/shapes/Dataset-crs> a sh:PropertyShape ;
        sh:class skos:Concept ;
        sh:group <https://example.com/gswa/shapes/Dataset-coverage-group> ;
        sh:maxCount 1 ;
        sh:name "Coordinate Reference System" ;
        sh:node [ sh:property [ sh:hasValue <https://example.com/gswa/epsg> ;
                        sh:path skos:inScheme ] ] ;
        sh:order 1 ;
        sh:path <https://example.com/gswa/data/crs> .

    <https://example.com/gswa/shapes/Dataset-dateModified> a sh:PropertyShape ;
        sh:datatype xsd:date ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:maxCount 1 ;
        sh:minCount 1 ;
        sh:name "Metadata Date" ;
        sh:order 7 ;
        sh:path schema:dateModified .

    <https://example.com/gswa/shapes/Dataset-datePublished> a sh:PropertyShape ;
        sh:datatype xsd:date ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:maxCount 1 ;
        sh:name "Publication Date" ;
        sh:order 6 ;
        sh:path schema:datePublished .

    <https://example.com/gswa/shapes/Dataset-identifier> a sh:PropertyShape ;
        ns1:singleLine true ;
        sh:datatype xsd:token ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:name "Unique ID" ;
        sh:order 1 ;
        sh:path schema:identifier .

    <https://example.com/gswa/shapes/Dataset-includeInDataCatalog> a sh:PropertyShape ;
        sh:class schema:DataCatalog ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:minCount 1 ;
        sh:name "In Data Catalog" ;
        sh:order 9 ;
        sh:path schema:includeInDataCatalog .

    <https://example.com/gswa/shapes/Dataset-keywords> a sh:PropertyShape ;
        sh:class skos:Concept ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:name "Search Words" ;
        sh:node [
            sh:property [
                sh:path skos:inScheme ;
                sh:hasValue <https://linked.data.gov.au/def/GSWA-vocabulary-themes> ;
            ] ;
            sh:property [
                sh:path skos:prefLabel ;
                dash:propertyRole dash:LabelRole ;
            ] ;
        ] ;
        sh:order 3 ;
        sh:path schema:keywords ;
        ns2:targetGraph <urn:graph:vocabs> .

    <https://example.com/gswa/shapes/Dataset-lineage> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-data-quality-group> ;
        sh:maxCount 1 ;
        sh:name "Lineage" ;
        sh:order 0 ;
        sh:path <https://example.com/gswa/data/lineage> .

    <https://example.com/gswa/shapes/Dataset-logicalConsistency> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-data-quality-group> ;
        sh:maxCount 1 ;
        sh:name "Logical Consistency" ;
        sh:order 3 ;
        sh:path <https://example.com/gswa/data/logicalConsistency> .

    <https://example.com/gswa/shapes/Dataset-name> a sh:PropertyShape ;
        ns1:propertyRole ns1:LabelRole ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:maxCount 1 ;
        sh:minCount 1 ;
        sh:name "Title" ;
        sh:order 0 ;
        sh:path schema:name .

    <https://example.com/gswa/shapes/Dataset-positionalAccuracy> a sh:PropertyShape ;
        ns1:singleLine false ;
        sh:datatype rdf:langString ;
        sh:group <https://example.com/gswa/shapes/Dataset-data-quality-group> ;
        sh:maxCount 1 ;
        sh:name "Positional Accuracy" ;
        sh:order 1 ;
        sh:path <https://example.com/gswa/data/positionalAccuracy> .

    <https://example.com/gswa/shapes/Dataset-publisher> a sh:PropertyShape ;
        sh:class schema:Organization ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:name "Publisher" ;
        sh:order 4 ;
        sh:path schema:publisher .

    <https://example.com/gswa/shapes/Dataset-qualifiedAttribution> a sh:PropertyShape ;
        ns1:editor ns1:DetailsEditor ;
        sh:group <https://example.com/gswa/shapes/Dataset-contact-group> ;
        sh:name "Contact Person" ;
        sh:node [ sh:property [ ns1:editor ns1:DetailsEditor ;
                        sh:maxCount 1 ;
                        sh:minCount 1 ;
                        sh:name "Contact Information" ;
                        sh:node [ sh:property [ ns1:propertyRole ns1:LabelRole ;
                                        sh:datatype xsd:string ;
                                        sh:maxCount 1 ;
                                        sh:minCount 1 ;
                                        sh:name "Name" ;
                                        sh:order 0 ;
                                        sh:path schema:name ],
                                    [ ns1:editor ns1:DetailsEditor ;
                                        sh:name "Contact Point" ;
                                        sh:node [ sh:property [ sh:datatype xsd:string ;
                                                        sh:maxCount 1 ;
                                                        sh:name "Contact Type" ;
                                                        sh:order 0 ;
                                                        sh:path schema:contactType ],
                                                    [ sh:datatype xsd:string ;
                                                        sh:name "Telephone" ;
                                                        sh:order 1 ;
                                                        sh:path schema:telephone ],
                                                    [ sh:datatype xsd:string ;
                                                        sh:name "Email" ;
                                                        sh:order 2 ;
                                                        sh:path schema:email ] ] ;
                                        sh:order 1 ;
                                        sh:path schema:contactPoint ],
                                    [ ns1:editor ns1:DetailsEditor ;
                                        sh:name "Address" ;
                                        sh:node [ sh:property [ sh:datatype xsd:string ;
                                                        sh:maxCount 1 ;
                                                        sh:minCount 1 ;
                                                        sh:name "State or Territory" ;
                                                        sh:order 2 ;
                                                        sh:path schema:addressRegion ],
                                                    [ sh:datatype xsd:string ;
                                                        sh:maxCount 1 ;
                                                        sh:minCount 1 ;
                                                        sh:name "Postcode" ;
                                                        sh:order 3 ;
                                                        sh:path schema:postalCode ],
                                                    [ sh:datatype xsd:string ;
                                                        sh:maxCount 1 ;
                                                        sh:minCount 1 ;
                                                        sh:name "Street" ;
                                                        sh:order 0 ;
                                                        sh:path schema:streetAddress ],
                                                    [ sh:datatype xsd:string ;
                                                        sh:maxCount 1 ;
                                                        sh:minCount 1 ;
                                                        sh:name "Suburb" ;
                                                        sh:order 1 ;
                                                        sh:path schema:addressLocality ] ] ;
                                        sh:order 2 ;
                                        sh:path schema:address ] ] ;
                        sh:order 1 ;
                        sh:path prov:agent ],
                    [ sh:class skos:Concept ;
                        sh:maxCount 1 ;
                        sh:minCount 1 ;
                        sh:name "Role" ;
                        sh:node [ sh:property [ sh:hasValue <https://example.com/gswa/role> ;
                                        sh:path skos:inScheme ] ] ;
                        sh:order 0 ;
                        sh:path prov:hadRole ] ] ;
        sh:nodeKind sh:BlankNode ;
        sh:order 0 ;
        sh:path prov:qualifiedAttribution .

    <https://example.com/gswa/shapes/Dataset-repeatFrequency> a sh:PropertyShape ;
        sh:class skos:Concept ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:maxCount 1 ;
        sh:minCount 1 ;
        sh:name "Maintenance and Update" ;
        sh:node [ sh:property [ sh:hasValue <http://purl.org/cld/freq> ;
                        sh:path skos:inScheme ] ] ;
        sh:order 8 ;
        sh:path schema:repeatFrequency .

    <https://example.com/gswa/shapes/Dataset-spatialCoverage> a sh:PropertyShape ;
        ns1:editor ns1:DetailsEditor ;
        sh:group <https://example.com/gswa/shapes/Dataset-coverage-group> ;
        sh:maxCount 1 ;
        sh:name "Spatial Coverage" ;
        sh:node [ sh:property [ ns1:editor ns1:DetailsEditor ;
                        sh:maxCount 1 ;
                        sh:minCount 1 ;
                        sh:name "Geometry" ;
                        sh:node [ sh:property [ sh:datatype xsd:string ;
                                        sh:maxCount 1 ;
                                        sh:minCount 1 ;
                                        sh:name "Box" ;
                                        sh:path schema:box ] ] ;
                        sh:nodeKind sh:BlankNode ;
                        sh:path schema:geo ] ] ;
        sh:nodeKind sh:BlankNode ;
        sh:order 2 ;
        sh:path schema:spatialCoverage .

    <https://example.com/gswa/shapes/Dataset-status> a sh:PropertyShape ;
        sh:class skos:Concept ;
        sh:group <https://example.com/gswa/shapes/Dataset-metadata-group> ;
        sh:maxCount 1 ;
        sh:minCount 1 ;
        sh:name "Status" ;
        sh:node [ sh:property [ sh:hasValue <https://example.com/gswa/status> ;
                        sh:path skos:inScheme ] ] ;
        sh:order 8 ;
        sh:path schema:status .

    <https://example.com/gswa/shapes/Dataset-temporalCoverage> a sh:PropertyShape ;
        sh:datatype xsd:string ;
        sh:group <https://example.com/gswa/shapes/Dataset-coverage-group> ;
        sh:maxCount 1 ;
        sh:name "Temporal Coverage" ;
        sh:order 0 ;
        sh:path schema:temporalCoverage .

    <https://example.com/gswa/shapes/Dataset-coverage-group> a sh:PropertyGroup ;
        rdfs:label "Temporal and Spatial Coverage" ;
        sh:order 1 .

    <https://example.com/gswa/shapes/Dataset-data-quality-group> a sh:PropertyGroup ;
        rdfs:label "Data Quality" ;
        sh:order 2 .

    <https://example.com/gswa/shapes/Dataset-metadata-group> a sh:PropertyGroup ;
        rdfs:label "Metadata" ;
        sh:order 0 .
  }
  `)
  addQuads(dataQuads)
  addQuads(shaclQuads)
}

const meta = {
  title: 'AutoCompleteEditorRemote',
  component: AutoCompleteEditorRemote,
  tags: ['autodocs']
} satisfies Meta<typeof AutoCompleteEditorRemote>

export default meta

type Story = StoryObj<typeof meta>

export const main: Story = {
  render: (args, { loaded: { args: loadedArgs } }) => {
    return h(AutoCompleteEditorRemote, {
      ...loadedArgs
    })
  },
  loaders: [
    async () => {
      reset()
      console.log('loading data')
      loadData()
      console.log('data loaded')
      console.log(`store size: ${shui.value.store.size}`)

      setSparqlUrl('http://localhost:8000/sparql')

      const schema = await shui.value.getSchema(focusNode, dataGraph, nodeShape)
      const constraintComponents =
        schema['https://example.com/C1F424F2-DAA2-40BD-8B28-A3B9D7851E17'].predicates[
          'https://schema.org/keywords'
        ].constraintComponents

      return {
        args: {
          term: focusNode,
          constraintComponents: constraintComponents,
          dataGraph
        }
      }
    }
  ]
}
