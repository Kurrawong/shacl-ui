from pathlib import Path

from rdflib import DCTERMS, Graph, URIRef

from shacl_ui import get_label

current_dir = Path(__file__).parent


def test():
    graph = Graph().parse(current_dir / "data/catprez.ttl")
    assert (
        get_label(
            URIRef("https://data.idnau.org/pid/system/catprez"), graph, DCTERMS.title
        )
        == "CatPrez System Catalogue"
    )
    assert (
        get_label(URIRef("https://data.idnau.org/pid/system/catprez"), graph)
        == "ns1:catprez"
    )
