import json
import logging
import time

import httpx
from pydantic import ValidationError

from shui.settings import settings

from ..base import Client
from .exceptions import SparqlResponseError
from .models import (
    SparqlBooleanResults,
    SparqlJsonResults,
)

logger = logging.getLogger(__name__)


class SparqlClient(Client):
    """A client for SPARQL requests to a remote triplestore"""

    def __init__(
        self,
        sparql_endpoint: str,
        sparql_update_endpoint: str = None,
        timeout: int = 60,
        auth: tuple[str | bytes, str | bytes] = None,
    ) -> None:
        self._sparql_endpoint = sparql_endpoint
        self._sparql_update_endpoint = (
            sparql_update_endpoint
            if sparql_update_endpoint is not None
            else sparql_endpoint
        )
        self._client = httpx.AsyncClient(auth=auth, timeout=timeout)

    async def post(
        self,
        query: str,
        is_update: bool = False,
        accept: str = "application/sparql-results+json",
    ) -> tuple[SparqlJsonResults | SparqlBooleanResults | str | None, str | None]:
        # TODO: Add sparql parsing to check and prevent sending sparql update queries.
        if is_update:
            raise ValueError("SPARQL Update not supported with this client.")

        headers = {
            # TODO: This accept header value is not always appropriate for CONSTRUCT queries.
            #   Seems like most triplestores ignore this for CONSTRUCT queries, so should still work fine.
            "accept": accept,
            "content-type": (
                "application/sparql-query"
                if not is_update
                else "application/sparql-update"
            ),
        }

        logger.debug(f"Sending a SPARQL {'UPDATE ' if is_update else ''}request.")
        starttime = time.time()
        response = await self._client.post(
            self._sparql_endpoint if not is_update else self._sparql_update_endpoint,
            headers=headers,
            content=query,
        )
        logger.debug(f"Request completed in {(time.time() - starttime):.2f} seconds.")

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as err:
            raise SparqlResponseError(
                f"Received unsuccessful response status code {response.status_code}. {response.text}\n{query}"
            ) from err

        if response.status_code == 204:
            return None, response.headers.get("content-type")

        if "application/sparql-results+json" in response.headers.get("Content-Type"):
            data = response.json()
            try:
                return SparqlBooleanResults(**data), response.headers.get(
                    "content-type"
                )
            except ValidationError:
                try:
                    return SparqlJsonResults(**data), response.headers.get(
                        "content-type"
                    )
                except ValidationError as err:
                    raise SparqlResponseError(
                        f"Could not parse JSON SPARQL response to model. \n{json.dumps(data, indent=2)}\nError: {err}"
                    )

        return response.text, response.headers.get("content-type")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_t, exc_v, exc_tb):
        await self._client.aclose()


async def get_sparql_client():
    async with SparqlClient(settings.sparql_endpoint) as client:
        yield client


__all__ = ["SparqlClient", "get_sparql_client"]
