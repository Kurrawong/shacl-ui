import json
from textwrap import dedent

from fastapi import Depends
from jinja2 import Template
from loguru import logger
from pydantic import BaseModel, ConfigDict, Field
from pyld import jsonld
from rdflib import RDF, Graph

from shui.clients.sparql_client import SparqlClient, get_sparql_client
from shui.content_type import ContentTypeService
from shui.namespaces import CRUD

frame = {
    "@context": {
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "sdo": "https://schema.org/",
    },
    "@type": "sdo:Thing",
}


class CollectionItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    iri: str = Field(..., alias="@id")
    label: str = Field(..., alias="rdfs:label")
    description: str = Field("", alias="rdfs:comment")


class CollectionService:
    def __init__(self, client: SparqlClient) -> None:
        self._client = client
        self._content_type_service = ContentTypeService(self._client)

    async def get_list(self, collection_id: str, page: int, per_page: int, q: str):
        client = self._client
        content_type_service = self._content_type_service
        content_type_model = await content_type_service.get_one_by_id(collection_id)
        if content_type_model is None:
            raise Exception(f"No content type found for collection {collection_id}")
        content_type = Graph().parse(
            data=content_type_model.model_dump_json(by_alias=True, round_trip=True),
            format="json-ld",
        )
        content_type_iri = content_type.value(
            predicate=RDF.type, object=CRUD.ContentType
        )
        if content_type_iri is None:
            raise Exception(f"No content type found for collection {collection_id}")
        target_class = content_type.value(content_type_iri, CRUD.targetClass)
        if target_class is None:
            raise Exception(f"No target class found for collection {collection_id}")
        content_type_graph = content_type.value(content_type_iri, CRUD.graph)
        if content_type_graph is None:
            raise Exception(
                f"No content type graph found for collection {collection_id}"
            )
        # TODO: get the label role and description role to get the property and remove
        #       the hardcoded sdo:name in query.
        limit = per_page
        offset = (page - 1) * per_page
        query = dedent(
            Template(
                """
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX sdo: <https://schema.org/>
                PREFIX text: <http://jena.apache.org/text#>
                CONSTRUCT {
                    ?iri a sdo:Thing ;
                        rdfs:label ?label ;
                        rdfs:comment ?description .
                }
                FROM <{{ graph_name }}>
                WHERE {
                    {
                        SELECT DISTINCT ?iri
                        WHERE {
                            {% if q %}
                            {
                                SELECT DISTINCT ?iri
                                WHERE {
                                    (?iri ?score ?matchedLabel ?graph) text:query (sdo:name "{{ q }}*") .
                                }
                            }
                            {% endif %}
                            
                            ?iri a <{{ target_class }}> ;
                                sdo:name ?label .
                        }
                        ORDER BY ?label
                        LIMIT {{ limit }}
                        OFFSET {{ offset }}
                    }
                    
                    ?iri sdo:name ?_label .
                    BIND(STR(?_label) AS ?label)
                    
                    OPTIONAL {
                        ?iri sdo:description ?_description .
                        BIND(STR(?_description) AS ?description)
                    }
                }
                """
            ).render(
                graph_name=content_type_graph,
                target_class=target_class,
                q=q,
                limit=limit,
                offset=offset,
            )
        )
        logger.debug(query)
        result = await client.post(query, accept="text/turtle")
        graph = Graph()
        graph.parse(data=result, format="turtle")
        doc = json.loads(graph.serialize(format="json-ld"))
        framed = jsonld.frame(doc, frame, {"omitGraph": False})
        values = [CollectionItem(**item) for item in framed["@graph"]]
        values.sort(key=lambda x: x.label)
        return values


async def get_collection_service(
    client: SparqlClient = Depends(get_sparql_client),
) -> CollectionService:
    return CollectionService(client)
