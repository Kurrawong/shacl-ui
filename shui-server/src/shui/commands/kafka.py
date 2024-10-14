import socket

from confluent_kafka import Producer
from loguru import logger

from shui.commands.base import Command, EventHeader
from shui.settings import settings


def producer_acknowledge(err, msg):
    if err is not None:
        # TODO: Improve raising error.
        logger.error(f"Failed to deliver message: {msg}, {err}")
        raise RuntimeError(err)
    else:
        logger.debug(f"Message delivered: {msg}")


class KafkaCommand(Command):
    def __init__(self, key: str, topic: str):
        super().__init__(key, topic)
        kafka_producer_config = {
            "bootstrap.servers": settings.kafka.bootstrap_server,
            "client.id": socket.gethostname(),
        }
        self._producer = Producer(kafka_producer_config)

    async def send(
        self, key: str, topic: str, message: str, headers: EventHeader, **kwargs
    ):
        try:
            self._producer.produce(
                topic,
                key=key,
                value=message,
                headers=headers.model_dump(by_alias=True),
                callback=producer_acknowledge,
            )
            self._producer.poll(1.0)
        except KeyboardInterrupt:
            exit()
        finally:
            self._producer.flush()
