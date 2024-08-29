import typing

from pydantic import BaseModel, Field
from typing_extensions import Annotated


class SparqlBooleanResultsHead(BaseModel):
    link: typing.Optional[list[str]] = None


class SparqlJsonResultsHead(BaseModel):
    vars: list[str]
    link: typing.Optional[list] = None


class URI(BaseModel):
    type: typing.Literal["uri"] = "uri"
    value: str


class Literal(BaseModel):
    type: typing.Literal["literal"] = "literal"
    value: str
    datatype: typing.Optional[str] = None
    lang: typing.Optional[str] = Field(None, alias="xml:lang")


class BlankNode(BaseModel):
    type: typing.Literal["bnode"] = "bnode"
    value: str


URIOrLiteralOrBlankNode = Annotated[
    URI | Literal | BlankNode, Field(..., discriminator="type")
]


class SparqlResults(BaseModel):
    bindings: list[dict[str, URIOrLiteralOrBlankNode]]


class SparqlJsonResults(BaseModel):
    head: SparqlJsonResultsHead
    results: SparqlResults


class SparqlBooleanResults(BaseModel):
    head: typing.Optional[SparqlBooleanResultsHead] = Field(
        default_factory=SparqlBooleanResultsHead
    )
    boolean: bool
