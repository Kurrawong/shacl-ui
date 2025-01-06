from azure.servicebus import ServiceBusMessage, TransportType
from azure.servicebus._pyamqp import AMQPClient
from azure.servicebus.aio import ServiceBusClient

from shui.commands.base import Command, EventHeader


class ServiceBusCommand(Command):
    def __init__(self, key: str, topic: str, conn_str: str, ws: bool):
        super().__init__(key, topic)
        self._topic = topic
        if ws:
            self._client = ServiceBusClient.from_connection_string(
                conn_str=conn_str, transport_type=TransportType.AmqpOverWebsocket
            )
        else:
            # Workaround for service bus emulator retrieved from https://github.com/Azure/azure-sdk-for-python/issues/34273#issuecomment-2503806488
            # Disable TLS. Workaround for https://github.com/Azure/azure-sdk-for-python/issues/34273
            org_init = AMQPClient.__init__

            def new_init(self, hostname, **kwargs):
                kwargs["use_tls"] = False
                org_init(self, hostname, **kwargs)

            AMQPClient.__init__ = new_init

            self._client = ServiceBusClient.from_connection_string(conn_str=conn_str)

    async def send(
        self, key: str, topic: str, message: str, headers: EventHeader, **kwargs
    ):
        content_type = headers.encoding_format
        sb_message = ServiceBusMessage(
            message,
            content_type=content_type,
            application_properties=headers.model_dump(by_alias=True),
            session_id=key,
        )
        sender = self._client.get_topic_sender(self._topic)
        await sender.send_messages(message=sb_message)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_t, exc_v, exc_tb):
        await self._client.close()
