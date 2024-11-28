import datetime
import json
from typing import Optional

from fastapi import Depends
from pydantic import BaseModel, ConfigDict, Field
from rdflib import SDO, XSD, BNode, Graph

from shui.commands import get_command
from shui.commands.base import Command, EventHeader
from shui.namespaces import CHANGE_EVENTS_GRAPH, EVENT
from shui.mime_types import RDF_PATCH_BODY, JSON_LD, TRIG

context = {
    str(SDO.about): {"@type": "@id"},
    str(SDO.additionalType): {"@type": "@id"},
    str(SDO.agent): {"@type": "@id"},
    str(SDO.schemaVersion): {"@type": str(XSD.anyURI)},
    str(SDO.startTime): {"@type": str(XSD.dateTime)},
    str(SDO.object): {"@type": "@id"},
}


class IRI(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str = Field(..., alias="@id")


class Literal(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    value: str = Field(..., alias="@value")
    type: str = Field("http://www.w3.org/2001/XMLSchema#string", alias="@type")


class MediaObject(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    # Required.
    text: Literal | str = Field(..., alias=SDO.text)
    about: list[str] | str = Field(..., alias=SDO.about)

    # With default values.
    id: str = Field(default_factory=lambda: f"_:{BNode()}", alias="@id")
    encoding_format: str = Field(RDF_PATCH_BODY, alias=SDO.encodingFormat)
    schema_version: Optional[str] = Field(
        None,
        alias=SDO.schemaVersion,
    )
    context: dict = Field(
        {"https://schema.org/about": {"@type": "@id"}}, alias="@context"
    )


class ChangeEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    # Required fields.
    agent: str = Field(..., alias=SDO.agent)
    # additional_type: str = Field(..., alias=SDO.additionalType)
    # description: str = Field(..., alias=SDO.description)
    object: str = Field(..., alias=SDO["object"])
    result: MediaObject = Field(..., alias=SDO.result)

    # With default values.
    id: str = Field(alias="@id")
    type: list[str] | str = Field([EVENT.ChangeEvent], alias="@type")
    # TODO: currently changes are accepted automatically.
    action_status: IRI = Field(IRI(id=EVENT.accepted), alias=SDO.actionStatus)
    participant: str | None = Field(None, alias=SDO.participant)
    schema_version: Optional[str] = Field(
        None,
        alias=SDO.schemaVersion,
    )
    start_time: str = Field(
        default_factory=lambda: datetime.datetime.now(datetime.UTC).strftime(
            "%Y-%m-%dT%H:%M:%S"
        ),
        alias=SDO.startTime,
    )

    context: dict = Field(context, alias="@context")

    def model_dump_trig(self, named_graph: str, content_type: str):
        data = {**self.model_dump(by_alias=True)}
        data_str = json.dumps(data)
        graph = Graph(identifier=named_graph).parse(
            data=data_str, format=JSON_LD
        )
        return graph.serialize(format=content_type)


class ChangeEventService:
    def __init__(self, command: Command):
        self._command = command

    async def create(
        self, user_id: str, iri: str, message: str, approve: bool = False, **kwargs
    ):
        command = self._command
        headers = EventHeader(
            about=iri, creator=user_id, encoding_format=TRIG
        )
        change_event = ChangeEvent(
            id=headers.id,
            agent=user_id,
            object=iri,
            result=MediaObject(text=message, about=iri),
        )
        message = change_event.model_dump_trig(
            named_graph=CHANGE_EVENTS_GRAPH,
            content_type=TRIG,
        )
        await command.send(
            key=kwargs.get("key") or command.key,
            topic=kwargs.get("topic") or command.topic,
            message=message,
            headers=headers,
            **kwargs,
        )

        if approve:
            # TODO: extract this out into its own method so that it can be reused outside of the create method.
            await command.send(
                key=kwargs.get("key") or command.key,
                topic=command.topic,
                message=change_event.result.text,
                headers=EventHeader(about=iri, creator=user_id),
            )


def get_change_event_service(command: Command = Depends(get_command)):
    return ChangeEventService(command)
