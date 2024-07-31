type Example = {
  label: string
  shacl: string
  data: string
}

const examples: Example[] = [
  {
    label: "Holger's Address",
    shacl: `\
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
  sh:order "1"^^xsd:decimal .`,
    data: `\
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
  rdfs:label "Holger's Address" .`
  },
  {
    label: 'GSWA Catalog Record',
    shacl: `\
PREFIX : <https://example.com/>
PREFIX dash: <http://datashapes.org/dash#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
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
            sh:path dcat:hadRole ;
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
.`,
    data: `\
PREFIX : <https://example.com/>
PREFIX dash: <http://datashapes.org/dash#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
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
        dcat:hadRole gswa-roles:digital-data-admin ;
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
        dcat:hadRole gswa-roles:chief-geoscientist ;
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
.`
  }
]

export default examples
