from enum import Enum
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

package_path = Path(__file__).parent.parent.parent
env_file = package_path / ".env"


class Environment(str, Enum):
    development = "development"
    production = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="shui__", env_file=env_file, env_file_encoding="utf-8"
    )

    # Server
    secret_key: str
    environment: Environment = Environment.production

    # Kafka
    kafka_key: str = "main"
    kafka_topic: str = "rdf-patch-log"
    kafka_bootstrap_server: str = "localhost:9092"

    # Redis
    redis_connection: str = "redis://localhost:6379"

    # SPARQL
    sparql_endpoint: str


settings = Settings()
