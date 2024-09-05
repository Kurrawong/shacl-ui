import json
from textwrap import dedent

from fastapi import Depends
from jinja2 import Template
from pydantic import BaseModel, ConfigDict, Field
from pyld import jsonld
from rdflib import Graph

from shui.clients.sparql_client import SparqlClient, get_sparql_client

GRAPH_NAME = "urn:system:graph:crud"

frame = {
    "@context": {
        "crud": "https://w3id.org/crud/",
        "gswa-shapes": "https://example.com/gswa/shapes/",
        "olis": "https://olis.dev/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "sdo": "https://schema.org/",
        "crud:graph": {"@type": "@id"},
        "crud:nodeShape": {"@type": "@id"},
        "crud:targetClass": {"@type": "@id"},
    },
    "@type": "crud:ContentType",
}


class ContentType(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    label: str = Field(..., alias="sdo:name")
    description: str = Field("", alias="sdo:description")
    id: str = Field(..., alias="crud:id")
    target_class: str = Field(..., alias="crud:targetClass")
    graph: str = Field(..., alias="crud:graph")
    node_shape: str = Field(..., alias="crud:nodeShape")


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
