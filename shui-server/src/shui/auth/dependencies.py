from fastapi import Depends

from shui.auth.manager import UserManager
from shui.auth.service import UserService
from shui.clients.sparql_client import SparqlClient, get_sparql_client


def get_user_service(sparql_client: SparqlClient = Depends(get_sparql_client)):
    yield UserService(sparql_client)


async def get_user_manager(user_service: UserService = Depends(get_user_service)):
    yield UserManager(user_service)
