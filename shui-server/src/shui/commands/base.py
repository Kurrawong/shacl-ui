from abc import ABC, abstractmethod

from shui.change_request import PatchLogHeader


class Command(ABC):
    def __init__(self, key: str, topic: str, **kwargs):
        self._key = key
        self._topic = topic

    @property
    def key(self) -> str:
        return self._key

    @property
    def topic(self) -> str:
        return self._topic

    @abstractmethod
    async def send(
        self, key: str, topic: str, message: str, headers: PatchLogHeader, **kwargs
    ):
        pass
