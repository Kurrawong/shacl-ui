from abc import ABC, abstractmethod


class Client(ABC):
    @abstractmethod
    async def post(self, query: str):
        pass
