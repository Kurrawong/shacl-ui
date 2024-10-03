import datetime
import json
import uuid

from pydantic import BaseModel, ConfigDict, Field
from rdflib import SDO, XSD, BNode, Graph

# from shui.commands import Command
# from shui.commands.kafka import KafkaCommand, get_kafka_command
from shui.namespaces import CR


class PatchLogHeader(BaseModel):
    """
    Patch Log Header.

    Uses schema.org terms but keep in mind that it is a simple key-value pair of metadata for Kafka messages,
    therefore it does not contain JSON-LD context.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    # Required fields.
    about: str = Field(..., alias=SDO.about)

    # With default values.
    is_part_of: str | None = Field(default=None, alias=SDO.isPartOf)
    id: str = Field(
        default_factory=lambda: f"urn:ladb:patchlog:{str(uuid.uuid4())}", alias="@id"
    )
    creator: str = Field("ladb.admin", alias=SDO.creator)
    date_created: str = Field(
        default_factory=lambda: datetime.datetime.now(datetime.UTC).strftime(
            "%Y-%m-%dT%H:%M:%S"
        ),
        alias=SDO.dateCreated,
    )
    encoding_format: str = Field("application/rdf-patch-body", alias=SDO.encodingFormat)
    schema_version: str = Field(
        "https://spatial-information-qld.github.io/ladb-schemas/schema.ttl",
        alias=SDO.schemaVersion,
    )


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
    encoding_format: str = Field("application/rdf-patch-body", alias=SDO.encodingFormat)
    schema_version: str = Field(
        "https://spatial-information-qld.github.io/ladb-schemas/schema.ttl",
        alias=SDO.schemaVersion,
    )
    context: dict = Field(
        {"https://schema.org/about": {"@type": "@id"}}, alias="@context"
    )


class ChangeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    # Required fields.
    agent: str = Field(..., alias=SDO.agent)
    # additional_type: str = Field(..., alias=SDO.additionalType)
    # description: str = Field(..., alias=SDO.description)
    object: str = Field(..., alias=SDO["object"])
    result: MediaObject = Field(..., alias=SDO.result)

    # With default values.
    id: str = Field(
        default_factory=lambda: f"urn:ladb:changerequest:{str(uuid.uuid4())}",
        alias="@id",
    )
    type: list[str] | str = Field([CR.ChangeRequest], alias="@type")
    # TODO: currently changes are accepted automatically.
    action_status: IRI = Field(IRI(id=CR.accepted), alias=SDO.actionStatus)
    participant: str | None = Field(None, alias=SDO.participant)
    schema_version: str = Field(
        "https://spatial-information-qld.github.io/ladb-schemas/schema.ttl",
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
        data = {**self.model_dump()}
        data_str = json.dumps(data)
        graph = Graph(identifier=named_graph).parse(
            data=data_str, format="application/ld+json"
        )
        return graph.serialize(format=content_type)


# class ChangeRequestCommand(Command):
#     async def create_change_request(
#         self,
#         change_request: ChangeRequest,
#         about: list[str],
#         encoding_format: str = "application/trig",
#     ) -> None:
#         """
#         Create a new change request object.
#
#         :param change_request: Change request object.
#         :param about: A list of IRIs of resources affected by this change request.
#         :param encoding_format: Format of the message.
#         """
#
#         await self.send(
#             key=settings.kafka_key,
#             topic=settings.kafka_topic,
#             message=change_request.model_dump_trig(
#                 named_graph=CHANGE_REQUESTS_GRAPH,
#                 content_type=encoding_format,
#             ),
#             headers=PatchLogHeader(
#                 about="|".join(about),
#                 is_part_of=change_request.id,
#                 encoding_format=encoding_format,
#             ).model_dump(by_alias=True),
#         )


# def get_change_request_command(kafka_client: KafkaCommand = Depends(get_kafka_command)):
#     return ChangeRequestCommand(kafka_client)
