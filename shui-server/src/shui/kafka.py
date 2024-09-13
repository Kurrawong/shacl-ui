import socket

from confluent_kafka import Producer
from loguru import logger

from shui.settings import settings

kafka_producer_config = {
    "bootstrap.servers": settings.kafka_bootstrap_server,
    "client.id": socket.gethostname(),
}
kafka_producer = Producer(kafka_producer_config)


def producer_acknowledge(err, msg):
    if err is not None:
        # TODO: Improve raising error.
        logger.error(f"Failed to deliver message: {msg}, {err}")
        raise RuntimeError(err)
    else:
        logger.debug(f"Message delivered: {msg}")


class KafkaClient:
    def __init__(self, producer: Producer):
        self.producer = producer

    async def send(self, key: str, topic: str, message: str, headers: dict):
        try:
            self.producer.produce(
                topic,
                key=key,
                value=message,
                headers=headers,
                callback=producer_acknowledge,
            )
            self.producer.poll(1.0)
        except KeyboardInterrupt:
            exit()
        finally:
            self.producer.flush()


def get_kafka_client():
    return KafkaClient(kafka_producer)
