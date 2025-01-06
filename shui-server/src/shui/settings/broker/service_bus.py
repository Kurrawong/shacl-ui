from shui.settings.env_file import env_file

from .base import BaseBrokerSettings, SettingsConfigDict


class ServiceBusSettings(BaseBrokerSettings):
    model_config = SettingsConfigDict(
        env_prefix="shui_service_bus__",
        env_file=env_file,
        env_file_encoding="utf-8",
        extra="allow",
    )

    conn_str: str
    subscription: str
    topic: str
    session_id: str
    ws: bool = True
