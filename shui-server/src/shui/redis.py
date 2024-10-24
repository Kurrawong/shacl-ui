from redis.asyncio import Redis
from redis.exceptions import ConnectionError

from shui.settings import settings

redis = Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    password=settings.redis_password,
    ssl=settings.redis_ssl,
    decode_responses=True,
    retry_on_error=[ConnectionError],
)
