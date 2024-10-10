import json
from textwrap import dedent

from fastapi import Depends
from jinja2 import Template
from pydantic import BaseModel, ConfigDict, Field
from pyld import jsonld
from rdflib import SDO, Graph

from shui.change_event import ChangeEventService, get_change_event_service
from shui.clients.sparql_client import SparqlClient, get_sparql_client


class ChangeEventAgent(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str = Field(alias="@id")
    name: str = Field(alias=str(SDO.name))


class ChangeEventResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    text: str = Field(alias=str(SDO.text))


class ChangeEventTimelineItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str = Field(alias="@id")
    description: str | None = Field(None, alias=str(SDO.description))
    agent: ChangeEventAgent = Field(alias=str(SDO.agent))
    start_time: str = Field(alias=str(SDO.startTime))
    action_status: str = Field(alias=str(SDO.actionStatus))
    result: ChangeEventResult = Field(alias=str(SDO.result))


class RecordService:
    def __init__(
        self, client: SparqlClient, change_event_service: ChangeEventService
    ) -> None:
        self._client = client
        self._change_event_service = change_event_service

    async def get_one_by_iri(self, iri: str, graph_name: str) -> str:
        client = self._client
        query = dedent(
            Template(
                """
                DESCRIBE <{{ iri }}>
                FROM <{{ graph_name }}>
                """
            ).render(iri=iri, graph_name=graph_name)
        )
        result = await client.post(query, accept="text/turtle")
        return result

    async def create_change_event(
        self,
        user_id: str,
        iri: str,
        patch_log: str,
    ):
        change_event_service = self._change_event_service
        await change_event_service.create(
            user_id,
            iri,
            patch_log,
            # TODO: use user access control to determine whether this is approved automatically or not.
            approve=True,
        )

    async def get_change_events(
        self,
        iri: str,
        page: int,
        per_page: int,
        action_statuses: list[str] = None,
    ) -> list[ChangeEventTimelineItem]:
        client = self._client
        query = dedent(
            Template(
                """
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX sdo: <https://schema.org/>
                PREFIX text: <http://jena.apache.org/text#>
                CONSTRUCT {
                    ?agent sdo:name ?agentLabel .
                    ?changeEvent sdo:result ?result .
                    ?result ?pp ?oo .
                    ?changeEvent ?p ?o .
                }
                WHERE {
                    {
                        SELECT ?changeEvent
                        WHERE {
                            GRAPH <urn:system:graph:change-events> {
                                ?changeEvent sdo:object <{{ iri }}> .
                
                                VALUES ?actionStatus {
                                    {% for action_status in action_statuses %}
                                        <{{ action_status }}>
                                    {% endfor %}
                                }
                
                                ?changeEvent sdo:actionStatus ?actionStatus ;
                                             sdo:startTime ?startTime .
                            }
                        }
                        ORDER BY DESC(?startTime)
                        LIMIT {{ limit }}
                        OFFSET {{ offset }}
                    }
                
                    GRAPH <urn:system:graph:change-events> {
                        ?changeEvent sdo:agent ?agent .
                        ?changeEvent sdo:result ?result .
                        ?result ?pp ?oo .
                
                        ?changeEvent ?p ?o .
                        FILTER(?p != sdo:result)
                    }
                
                    GRAPH <urn:system:graph:users> {
                        ?agent rdfs:label ?agentLabel .
                    }
                }
                """
            ).render(
                iri=iri,
                action_statuses=action_statuses or [],
                limit=per_page,
                offset=(page - 1) * per_page,
            )
        )
        result = await client.post(query)
        graph = Graph().parse(data=result)
        doc = json.loads(graph.serialize(format="application/ld+json"))
        framed = jsonld.frame(
            doc,
            {
                "@context": {
                    "https://schema.org/actionStatus": {"@type": "@id"},
                    "https://schema.org/startTime": {
                        "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                    },
                },
                "@type": "https://w3id.org/event/ChangeEvent",
            },
        )

        if "@graph" not in framed and "@id" not in framed:
            return []
        if "@graph" not in framed and "@id" in framed:
            return [ChangeEventTimelineItem(**framed)]
        return sorted(
            [ChangeEventTimelineItem(**item) for item in framed["@graph"]],
            key=lambda x: x.start_time,
            reverse=True,
        )


async def get_record_service(
    client: SparqlClient = Depends(get_sparql_client),
    change_event_service: ChangeEventService = Depends(get_change_event_service),
) -> RecordService:
    return RecordService(client, change_event_service)
