from shui.settings.env_file import env_file

from .base import BaseBrokerSettings, SettingsConfigDict


class KafkaSettings(BaseBrokerSettings):
    model_config = SettingsConfigDict(
        env_prefix="shui_kafka__",
        env_file=env_file,
        env_file_encoding="utf-8",
        extra="allow",
    )

    key: str = "main"
    topic: str = "rdf-patch-log"
    bootstrap_server: str = "localhost:9092"
