from fastapi import Depends
from rdflib import SH, Graph, URIRef

from shui.clients.sparql_client import SparqlClient, get_sparql_client


class ShaclService:
    def __init__(self, client: SparqlClient):
        self._client = client

    @staticmethod
    async def visit(starting_node: URIRef, client: SparqlClient):
        visited_nodes = set()
        graph = Graph()
        unvisited_nodes = [starting_node]
        while unvisited_nodes:
            iri = unvisited_nodes.pop()
            if iri not in visited_nodes:
                visited_nodes.add(iri)
                query = f"DESCRIBE <{iri}>"
                result = await client.post(query, accept="text/turtle")
                current_graph = Graph().parse(data=result, format="turtle")
                node_shapes = current_graph.objects(None, SH.node)
                for item in node_shapes:
                    if isinstance(item, URIRef):
                        unvisited_nodes.append(item)
                property_shapes = current_graph.objects(None, SH.property)
                for item in property_shapes:
                    if isinstance(item, URIRef):
                        unvisited_nodes.append(item)
                groups = current_graph.objects(None, SH.group)
                for item in groups:
                    if isinstance(item, URIRef):
                        unvisited_nodes.append(item)
                graph += current_graph

        return graph

    async def get_nodeshape_graph_closure(self, iri: str):
        return await self.visit(URIRef(iri), self._client)


def get_shacl_service(client: SparqlClient = Depends(get_sparql_client)):
    return ShaclService(client)
