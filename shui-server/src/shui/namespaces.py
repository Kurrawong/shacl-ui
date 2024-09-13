from rdflib import URIRef
from rdflib.namespace import DefinedNamespace, Namespace

CHANGE_REQUESTS_GRAPH = "urn:system:graph:cr"


class CRUD(DefinedNamespace):
    _NS = Namespace("https://w3id.org/crud/")
    _fail = True

    ContentType: URIRef

    labelProperty: URIRef
    descriptionProperty: URIRef
    graph: URIRef
    targetClass: URIRef
    nodeShape: URIRef


class CR(DefinedNamespace):
    _NS = Namespace("https://w3id.org/cr/")
    # Set to false because we need to use the datatype rdf-patch-body.
    _fail = False

    ChangeRequest: URIRef

    accepted: URIRef
    failed: URIRef
    pending: URIRef
    rejected: URIRef
