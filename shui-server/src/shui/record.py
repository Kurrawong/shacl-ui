from textwrap import dedent

from fastapi import Depends
from jinja2 import Template

from shui.change_event import ChangeEventService, get_change_event_service
from shui.clients.sparql_client import SparqlClient, get_sparql_client


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


async def get_record_service(
    client: SparqlClient = Depends(get_sparql_client),
    change_event_service: ChangeEventService = Depends(get_change_event_service),
) -> RecordService:
    return RecordService(client, change_event_service)
