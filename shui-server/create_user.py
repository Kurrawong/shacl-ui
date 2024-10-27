import asyncio
import contextlib

from shui.auth.dependencies import get_user_manager, get_user_service
from shui.auth.models import UserCreate
from shui.clients.sparql_client import get_sparql_client

get_sparql_client_context = contextlib.asynccontextmanager(get_sparql_client)
get_user_service_context = contextlib.contextmanager(get_user_service)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def create_user(email, password):
    async with get_sparql_client_context() as sparql_client:
        with get_user_service_context(sparql_client) as user_service:
            async with get_user_manager_context(user_service) as user_manager:
                await user_manager.create(UserCreate(email=email, password=password))


asyncio.run(create_user("admin@example.com", "password"))
