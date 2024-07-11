from pathlib import Path

from rdflib import Graph, URIRef

from shacl_ui import generate_shui_tree

current_dir = Path(__file__).parent

focus_node = URIRef("https://data.idnau.org/pid/system/catprez")
# data_graph = Graph().parse(current_dir / "tests/data/catprez.ttl")
data_graph = Graph()
shacl_graph = Graph().parse(current_dir / "tests/data/shacl.shacl.ttl")

ast = generate_shui_tree(focus_node, data_graph, shacl_graph)
