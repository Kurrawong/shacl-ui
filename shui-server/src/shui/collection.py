import json
from textwrap import dedent

from fastapi import Depends
from jinja2 import Template
from pydantic import BaseModel, ConfigDict, Field
from pyld import jsonld
from rdflib import RDF, Graph

from shui.clients.sparql_client import SparqlClient, get_sparql_client
from shui.content_type import ContentTypeService
from shui.namespaces import CRUD
from shui.mime_types import N_TRIPLES

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

    @staticmethod
    def _list_subquery(
        label_property: str,
        target_class: str,
        q: str,
        limit: int = 10,
        offset: int = 0,
        no_limit: bool = False,
    ):
        query = dedent(
            Template(
                """
                {
                    SELECT DISTINCT ?iri
                    WHERE {
                        {% if q %}
                        {
                            SELECT DISTINCT ?iri
                            WHERE {
                                (?iri ?score ?matchedLabel ?graph) text:query (<{{ label_property }}> "{{ q }}*") .
                            }
                        }
                        {% endif %}
                        
                        ?iri a <{{ target_class }}> ;
                            <{{ label_property }}> ?label .
                    }
                    ORDER BY ?label
                    {% if not no_limit %}
                    LIMIT {{ limit }}
                    OFFSET {{ offset }}
                    {% endif %}
                }
                """
            ).render(
                label_property=label_property,
                target_class=target_class,
                q=q,
                limit=limit,
                offset=offset,
                no_limit=no_limit,
            )
        )
        return query

    async def get_list_count(self, collection_id: str, q: str):
        # TODO: There is no error handling here because we expect the required values on the
        #       crud:ContentType instances to be in the correct shape.
        #       It may be a good idea to do a SHACL check here.
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
        label_property = content_type.value(content_type_iri, CRUD.labelProperty)
        description_property = content_type.value(
            content_type_iri, CRUD.descriptionProperty
        )
        target_class = content_type.value(content_type_iri, CRUD.targetClass)
        content_type_graph = content_type.value(content_type_iri, CRUD.graph)
        query = dedent(
            Template(
                """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX sdo: <https://schema.org/>
                PREFIX text: <http://jena.apache.org/text#>
                CONSTRUCT {
                    _:b1 rdf:value ?count
                }
                FROM <{{ graph_name }}>
                WHERE {
                    SELECT (COUNT(?iri) AS ?count) {
                        {{ subquery|indent(24, True) }}
                    }
                }
                """
            ).render(
                subquery=self._list_subquery(
                    label_property, target_class, q, no_limit=True
                ),
                label_property=label_property,
                description_property=description_property,
                graph_name=content_type_graph,
                target_class=target_class,
                q=q,
            )
        )
        result, _ = await client.post(query, accept=N_TRIPLES)
        graph = Graph().parse(data=result, format=N_TRIPLES)
        value = next(graph.objects())
        if value is None:
            raise ValueError("Failed to get the count.")
        return value.value

    async def get_list(self, collection_id: str, q: str, page: int, per_page: int):
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
        label_property = content_type.value(content_type_iri, CRUD.labelProperty)
        description_property = content_type.value(
            content_type_iri, CRUD.descriptionProperty
        )
        target_class = content_type.value(content_type_iri, CRUD.targetClass)
        content_type_graph = content_type.value(content_type_iri, CRUD.graph)
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
                
                    {{ subquery|indent(20, True) }}
                
                    {
                        SELECT ?iri (STR(SAMPLE(?_label)) AS ?label) (STR(SAMPLE(?_description)) AS ?description)
                        WHERE {
                            ?iri <{{ label_property }}> ?_label .
                        
                            OPTIONAL {
                                ?iri <{{ description_property }}> ?_description .
                            }
                        }
                        GROUP BY ?iri
                    }
                }
                """
            ).render(
                subquery=self._list_subquery(
                    label_property, target_class, q, limit, offset
                ),
                label_property=label_property,
                description_property=description_property,
                graph_name=content_type_graph,
                target_class=target_class,
                q=q,
                limit=limit,
                offset=offset,
            )
        )
        result, _ = await client.post(query, accept=N_TRIPLES)
        graph = Graph()
        graph.parse(data=result, format=N_TRIPLES)
        doc = json.loads(graph.serialize(format="json-ld"))
        framed = jsonld.frame(doc, frame, {"omitGraph": False})
        values = [CollectionItem(**item) for item in framed["@graph"]]
        values.sort(key=lambda x: x.label)
        return values


async def get_collection_service(
    client: SparqlClient = Depends(get_sparql_client),
) -> CollectionService:
    return CollectionService(client)
