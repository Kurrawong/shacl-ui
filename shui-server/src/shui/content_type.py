import json
from textwrap import dedent
from typing import Any

from fastapi import Depends
from jinja2 import Template
from pydantic import BaseModel, ConfigDict, Field, computed_field
from pyld import jsonld
from rdflib import RDF, Graph, URIRef

from shui.clients.sparql_client import SparqlClient, get_sparql_client
from shui.namespaces import CRUD

GRAPH_NAME = "urn:system:graph:crud"

frame = {
    "@context": {
        "crud": "https://w3id.org/crud/",
        "gswa-shapes": "https://example.com/gswa/shapes/",
        "olis": "https://olis.dev/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "sdo": "https://schema.org/",
        "crud:labelProperty": {"@type": "@id"},
        "crud:descriptionProperty": {"@type": "@id"},
        "crud:graph": {"@type": "@id"},
        "crud:nodeShape": {"@type": "@id"},
        "crud:targetClass": {"@type": "@id"},
    },
    "@type": "crud:ContentType",
}


class ContentType(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True, extra="allow", arbitrary_types_allowed=True
    )

    label: str = Field(..., alias="sdo:name")
    description: str = Field("", alias="sdo:description")
    id: str = Field(..., alias="crud:id")
    label_property: str = Field(..., alias="crud:labelProperty")
    description_property: str = Field(..., alias="crud:descriptionProperty")
    target_class: str = Field(..., alias="crud:targetClass")
    graph: str = Field(..., alias="crud:graph")
    node_shape: str = Field(..., alias="crud:nodeShape")

    def __init__(self, **data: Any) -> None:
        super().__init__(**data)
        self._graph = Graph().parse(
            data=self.model_dump_json(by_alias=True, round_trip=True),
            format="json-ld",
        )

    @computed_field
    def rdflib_graph(self) -> Graph:
        """The model as an RDFLib graph."""
        return self._graph

    @computed_field
    def iri(self) -> URIRef:
        """The resource's IRI."""
        content_type_iri = self.rdflib_graph.value(
            predicate=RDF.type, object=CRUD.ContentType
        )
        return content_type_iri

    def value(self, predicate: URIRef) -> str:
        """A shortcut to the RDFLib Graph's value method."""
        result = self.rdflib_graph.value(self.iri, predicate=predicate)
        if result is None:
            raise Exception(f"No value found for predicate {predicate}")
        return str(result)


class ContentTypeService:
    def __init__(self, client: SparqlClient) -> None:
        self._client = client

    async def get_list(self) -> list[ContentType]:
        client = self._client
        query = dedent(
            Template(
                """
                PREFIX crud: <https://w3id.org/crud/>
                DESCRIBE ?iri
                FROM <{{ graph_name }}>
                WHERE {
                    ?iri a crud:ContentType .
                }
                """
            ).render(graph_name=GRAPH_NAME)
        )
        result = await client.post(query, accept="text/turtle")
        graph = Graph()
        graph.parse(data=result, format="turtle")
        doc = json.loads(graph.serialize(format="json-ld"))
        framed = jsonld.frame(doc, frame, {"omitGraph": False})
        values = [ContentType(**item) for item in framed["@graph"]]
        values.sort(key=lambda x: x.label)
        return values

    async def get_one_by_id(self, content_type_id: str) -> ContentType | None:
        client = self._client
        query = dedent(
            Template(
                """
                PREFIX crud: <https://w3id.org/crud/>
                DESCRIBE ?iri
                FROM <{{ graph_name }}>
                WHERE {
                    ?iri a crud:ContentType ;
                        crud:id "{{ content_type_id }}" .
                }
                """
            ).render(graph_name=GRAPH_NAME, content_type_id=content_type_id)
        )
        result = await client.post(query, accept="text/turtle")
        graph = Graph()
        graph.parse(data=result, format="turtle")
        doc = json.loads(graph.serialize(format="json-ld"))
        framed = jsonld.frame(doc, frame)
        if "@graph" not in framed and "@id" not in framed:
            return None
        return ContentType(**framed)


async def get_content_type_service(
    client: SparqlClient = Depends(get_sparql_client),
) -> ContentTypeService:
    return ContentTypeService(client)
