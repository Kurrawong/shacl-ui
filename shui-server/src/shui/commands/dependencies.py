from shui.settings import settings
from shui.settings.broker.base import BrokerType


def get_command():
    if settings.broker_type == BrokerType.kafka:
        from shui.commands.kafka import KafkaCommand

        return KafkaCommand(settings.kafka.key, settings.kafka.topic)
    elif settings.broker_type == BrokerType.azure_service_bus:
        from shui.commands.service_bus import ServiceBusCommand

        return ServiceBusCommand(
            settings.service_bus.session_id,
            settings.service_bus.topic,
            conn_str=settings.service_bus.conn_str,
        )
