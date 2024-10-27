import redis.asyncio

from shui.settings import settings

redis = redis.asyncio.from_url(settings.redis_connection, decode_responses=True)
