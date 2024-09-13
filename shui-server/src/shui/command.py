from fastapi import Depends

from shui.kafka import KafkaClient, get_kafka_client


class Command:
    def __init__(self, client: KafkaClient):
        self.client = client

    async def create_message(
        self, key: str, topic: str, message: str, headers: dict
    ) -> None:
        await self.client.send(key=key, topic=topic, message=message, headers=headers)


def get_command(kafka_client: KafkaClient = Depends(get_kafka_client)):
    return Command(kafka_client)
