from enum import Enum

from pydantic_settings import BaseSettings, SettingsConfigDict

from shui.settings.env_file import env_file


class BrokerType(str, Enum):
    kafka = "kafka"
    azure_service_bus = "azure_service_bus"


class BaseBrokerSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="shui__", env_file=env_file, env_file_encoding="utf-8"
    )

    broker_type: BrokerType = BrokerType.kafka
