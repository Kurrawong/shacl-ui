import datetime
import uuid
from abc import ABC, abstractmethod

from pydantic import BaseModel, ConfigDict, Field
from rdflib import SDO


class EventHeader(BaseModel):
    """
    Event Header.

    Uses schema.org terms but keep in mind that it is a simple key-value pair of metadata for event broker messages,
    and should not include a JSON-LD context.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    # Required fields.
    about: str = Field(..., alias=SDO.about)

    # With default values.
    is_part_of: str | None = Field(default=None, alias=SDO.isPartOf)
    id: str = Field(
        default_factory=lambda: f"urn:system:change-events:{str(uuid.uuid4())}",
        alias="@id",
    )
    creator: str = Field(alias=SDO.creator)
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


class Command(ABC):
    def __init__(self, key: str, topic: str, **kwargs):
        self._key = key
        self._topic = topic

    @property
    def key(self) -> str:
        return self._key

    @property
    def topic(self) -> str:
        return self._topic

    @abstractmethod
    async def send(
        self, key: str, topic: str, message: str, headers: EventHeader, **kwargs
    ):
        pass
