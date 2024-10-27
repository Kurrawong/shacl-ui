from enum import Enum
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

from shui.settings.broker.base import BrokerType
from shui.settings.broker.kafka import KafkaSettings
from shui.settings.broker.service_bus import ServiceBusSettings
from shui.settings.env_file import env_file


class Environment(str, Enum):
    development = "development"
    production = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="shui__", env_file=env_file, env_file_encoding="utf-8", extra="allow"
    )

    # Server
    secret_key: str
    environment: Environment = Environment.production

    # Event Broker
    broker_type: BrokerType = BrokerType.kafka
    kafka: Optional[KafkaSettings] = None
    service_bus: Optional[ServiceBusSettings] = None

    # Redis
    redis_connection: str = "redis://localhost:6379"

    # SPARQL
    sparql_endpoint: str

    def configure_broker_settings(self):
        if self.broker_type == BrokerType.kafka:
            self.kafka = KafkaSettings()
        elif self.broker_type == BrokerType.azure_service_bus:
            self.service_bus = ServiceBusSettings()


settings = Settings()
settings.configure_broker_settings()
