from rdflib import URIRef
from rdflib.namespace import DefinedNamespace, Namespace

CHANGE_EVENTS_GRAPH = "urn:system:graph:change-events"


class CRUD(DefinedNamespace):
    _NS = Namespace("https://w3id.org/crud/")
    _fail = True

    ContentType: URIRef

    labelProperty: URIRef
    descriptionProperty: URIRef
    graph: URIRef
    targetClass: URIRef
    nodeShape: URIRef
    namespace: URIRef


class EVENT(DefinedNamespace):
    _NS = Namespace("https://w3id.org/event/")
    _fail = True

    ChangeEvent: URIRef

    accepted: URIRef
    failed: URIRef
    pending: URIRef
    rejected: URIRef
