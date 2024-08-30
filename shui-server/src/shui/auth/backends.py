from fastapi_users.authentication import (
    AuthenticationBackend,
    JWTStrategy,
    RedisStrategy,
)

from shui.redis import redis
from shui.settings import settings

from .transports import bearer_transport, cookie_transport

auth_backend = AuthenticationBackend(
    name="sql",
    transport=cookie_transport,
    get_strategy=lambda: RedisStrategy(
        redis,
        key_prefix="olis_users_token",
    ),
)

jwt_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    # TODO: make lifetime seconds configurable
    get_strategy=lambda: JWTStrategy(secret=settings.secret_key, lifetime_seconds=600),
)
