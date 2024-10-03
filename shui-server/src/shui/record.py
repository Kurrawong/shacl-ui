from textwrap import dedent

from fastapi import Depends
from jinja2 import Template

from shui.change_request import PatchLogHeader
from shui.clients.sparql_client import SparqlClient, get_sparql_client
from shui.commands import Command, get_command


class RecordService:
    def __init__(self, client: SparqlClient, command: Command) -> None:
        self._client = client
        self._command = command

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

    async def create_change_request(
        self,
        iri: str,
        patch_log: str,
    ):
        command = self._command
        await command.send(
            command.key,
            command.topic,
            patch_log,
            PatchLogHeader(about=iri),
        )


async def get_record_service(
    client: SparqlClient = Depends(get_sparql_client),
    command: Command = Depends(get_command),
) -> RecordService:
    return RecordService(client, command)
