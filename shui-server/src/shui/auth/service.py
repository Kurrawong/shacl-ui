import traceback
from textwrap import dedent
from typing import Any, Dict

from fastapi_users.db import BaseUserDatabase
from fastapi_users.models import ID, UP
from jinja2 import Template
from loguru import logger
from rdflib import RDF, SDO, Graph, Literal

from shui.clients.sparql_client import SparqlClient
from shui.mime_types import TURTLE

from .models import UserCreateDb
from .namespaces import OLIS

GRAPH_NAME = "urn:system:graph:users"


class UserService(BaseUserDatabase):
    def __init__(self, client: SparqlClient):
        super().__init__()
        self._client = client

    @staticmethod
    def _to_model(result) -> UserCreateDb:
        graph = Graph().parse(data=result, format="turtle")
        # TODO: handle when iri is None.
        iri = graph.value(predicate=RDF.type, object=OLIS.User)
        email = graph.value(iri, SDO.email)
        hashed_password: Literal | None = graph.value(iri, OLIS.hashedPassword)
        is_active: Literal | None = graph.value(iri, OLIS.isActive)
        is_superuser: Literal | None = graph.value(iri, OLIS.isSuperuser)
        is_verified: Literal | None = graph.value(iri, OLIS.isVerified)

        user = UserCreateDb(
            id=str(iri),
            email=str(email) if email is not None else None,
            hashed_password=str(hashed_password)
            if hashed_password is not None
            else None,
            is_active=is_active.value if is_active is not None else None,
            is_superuser=is_superuser.value if is_superuser is not None else None,
            is_verified=is_verified.value if is_verified is not None else None,
        )
        return user

    async def get(self, id: ID) -> UP | None:
        """Get User by IRI.

        This is used by FastAPI Users, which requires returning None when not found.

        :return: Returns a User model if found or None.
        """
        client = self._client
        query = dedent(
            Template(
                """
                DESCRIBE <{{ iri }}>
                FROM <{{ graph_name }}>
                """
            ).render(iri=id, graph_name=GRAPH_NAME)
        )
        result, _ = await client.post(query, accept=TURTLE)
        try:
            return self._to_model(result)
        except Exception:
            logger.debug(f"Failed to retrieve user with id {id}")
            return None

    async def get_by_email(self, email: str) -> UP | None:
        """Get User by email.

        This is used by FastAPI Users, which requires returning None when not found.

        :return: Returns a User model if found or None.
        """
        client = self._client
        query = dedent(
            Template(
                """
                PREFIX sdo: <https://schema.org/>
                DESCRIBE ?iri
                FROM <{{ graph_name }}>
                WHERE {
                    ?iri sdo:email "{{ email }}" .
                }
                """
            ).render(email=email, graph_name=GRAPH_NAME)
        )
        result, _ = await client.post(query, accept=TURTLE)
        try:
            return self._to_model(result)
        except Exception:
            logger.error(traceback.format_exc())
            logger.debug(f"Failed to retrieve user with email {email}")
            return None

    async def create(self, create_dict: Dict[str, Any]) -> UP:
        # iri = f"urn:user:{uuid.uuid4()}"
        # user = UserCreateDb(**create_dict, id=iri)
        raise NotImplementedError("Registration functionality not implemented yet.")
        # query = dedent(
        #     Template(
        #         """
        #         PREFIX olis: <https://olis.dev/>
        #         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        #         PREFIX sdo: <https://schema.org/>
        #
        #         INSERT DATA {
        #             GRAPH <{{ graph_name }}> {
        #                 <{{ iri }}>
        #                     a olis:User ;
        #                     rdfs:label "{{ user.name }}" ;
        #                     sdo:email "{{ user.email }}" ;
        #                     olis:hashedPassword
        #             }
        #         }
        #         """
        #     ).render(iri=iri, user=user, graph_name=GRAPH_NAME)
        # )
