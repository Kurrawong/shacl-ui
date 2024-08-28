"""
A simple Kafka file producer to send RDF content from a file to a topic.
"""

import argparse
import datetime
import socket

from confluent_kafka import Producer
from loguru import logger
from rdflib import SDO, Graph, URIRef
from pydantic_settings import BaseSettings

SUPPORTED_FORMATS = ["application/rdf-patch", "text/turtle", "application/trig"]


class Settings(BaseSettings):
    kafka_topic: str = "rdf-patch-log"
    kafka_bootstrap_server: str = "localhost:9997"


settings = Settings(_env_file=".env")


def producer_acknowledge(err, msg):
    if err is not None:
        logger.error(f"Failed to deliver message: {msg}, {err}")
    else:
        logger.info(f"Message delivered: {msg}")


if __name__ == "__main__":
    producer_config = {
        "bootstrap.servers": settings.kafka_bootstrap_server,
        "client.id": socket.gethostname(),
    }
    producer = Producer(producer_config)

    parser = argparse.ArgumentParser(
        "File Producer", description="Add a file's content to a Kafka topic."
    )
    parser.add_argument("key", help="Kafka message key")
    parser.add_argument(
        "filename", help="File content to be added as the message value"
    )
    parser.add_argument(
        "--format",
        required=False,
        default="application/rdf-patch",
        help="The content type of the file",
    )
    args = parser.parse_args()
    key = args.key
    content_type = args.format
    filename = args.filename

    if content_type not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported content type: {content_type}")

    with open(filename, "r", encoding="utf-8") as file:
        content = file.read()
        graph = Graph().parse(data=content, format=content_type)
        topic = settings.kafka_topic

        logger.info(f"Sending file content to topic {topic} with key {key}")
        try:
            producer.produce(
                topic,
                key=key,
                value=content,
                callback=producer_acknowledge,
                headers={
                    SDO.encodingFormat: content_type,
                    SDO.dateCreated: datetime.datetime.now(datetime.UTC).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    SDO.schemaVersion: "https://spatial-information-qld.github.io/ladb-schemas/schema.ttl",
                    SDO.about: "|".join(
                        list(
                            x
                            for x in graph.subjects(None, None, unique=True)
                            if isinstance(x, URIRef)
                        )
                    ),
                    SDO.creator: "file_producer.py",
                },
            )
            producer.poll(1.0)
        except KeyboardInterrupt:
            exit()
        finally:
            producer.flush()
