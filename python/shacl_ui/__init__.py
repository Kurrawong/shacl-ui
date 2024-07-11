import itertools
from collections import defaultdict
from typing import Iterator

from pydantic import BaseModel
from pyshacl.shape import Shape
from pyshacl.shapes_graph import ShapesGraph
from rdflib import RDF, RDFS, Graph, Literal, URIRef, SH
from rdflib.term import IdentifiedNode

frame = {
    "@context": {
        "dash": "http://datashapes.org/dash",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "sh": "http://www.w3.org/ns/shacl#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
    },
    "@type": "http://www.w3.org/ns/shacl#NodeShape",
}

x = {
    "id": "https://data.idnau.org/pid/system/catprez",
    "children": [
        {
            "predicate": {
                "type": "IRI",
                "id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                "label": {
                    "value": "Type",
                    "datatype": "http://www.w3.org/2001/XMLSchema#string",
                    "language": None,
                },
                "widget": "dash:LabelViewer",
                "available_widgets": ["dash:LabelViewer"],
            },
            "object": {
                "type": "IRI",
                "id": "http://www.w3.org/ns/dcat#Catalog",
                "label": "Catalog",
                "widget": "dash:LabelViewer",
                "available_widgets": ["dash:LabelViewer"],
            },
        }
    ],
}

y = {
    "id": "urn:shape:NullShape",
    "type": "sh:NodeShape",
    "label": "Default",
    "comment": "",
    "propertyGroups": [
        {
            "id": "urn:property-group:default",
            "order": 9999,
            "label": "",
        }
    ]
}


class ShuiIdentifiedNode(BaseModel):
    id: str
    children: list["ShuiIdentifiedNode"]


def get_label(
    focus_node: IdentifiedNode,
    data_graph: Graph,
    label_predicate: URIRef = RDFS.label,
    lang: str = None,
) -> str:
    # TODO: lang handling
    value = data_graph.value(focus_node, label_predicate)
    return str(value) if value is not None else data_graph.qname(focus_node)


def get_target_to_shapes_mapping(shapes: list[Shape]) -> dict[URIRef, set[Shape]]:
    target_to_shapes = defaultdict(set)
    for shape in shapes:
        (
            target_nodes,
            target_classes,
            implicit_targets,
            target_objects_of,
            target_subjects_of,
        ) = shape.target()
        for target_node in target_nodes:
            target_to_shapes[target_node].add(shape)
        for target_class in target_classes:
            target_to_shapes[target_class].add(shape)
        for implicit_target in implicit_targets:
            target_to_shapes[implicit_target].add(shape)
        for target_object in target_objects_of:
            target_to_shapes[target_object].add(shape)
        for target_subject in target_subjects_of:
            target_to_shapes[target_subject].add(shape)
    return target_to_shapes


def walk(focus_node: IdentifiedNode, graph: Graph):
    tree = []
    for pred, obj in graph.predicate_objects(focus_node, unique=True):
        if isinstance(obj, IdentifiedNode):
            tree += walk(obj, graph)


def add_missing_sh_groups(shapes: list[Shape], shapes_graph: ShapesGraph) -> None:
    for shape in shapes:
        if not shape.is_property_shape:
            property_shapes = shape.property_shapes()

            # Check whether each property shape is part of a group.
            # If not, create a default group for this node shape and add the property shape to the group.
            for property_shape in property_shapes:
                values = list(shape.get_other_shape(property_shape).objects(SH.order))
                if not values:
                    shapes_graph.graph.add((property_shape, SH.order, Literal(9999)))

    shapes_graph.graph.print(format="json-ld")


def generate_shui_tree(focus_node: URIRef, data_graph: Graph, shacl_graph: Graph):
    cbd = data_graph.cbd(focus_node)
    # tree = walk(focus_node, cbd)

    shapes_graph = ShapesGraph(shacl_graph)
    shapes = shapes_graph.shapes
    target_to_shapes = get_target_to_shapes_mapping(shapes)
    add_missing_sh_groups(shapes, shapes_graph)

    print(target_to_shapes)
