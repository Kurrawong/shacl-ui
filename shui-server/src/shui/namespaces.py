from rdflib import URIRef
from rdflib.namespace import DefinedNamespace, Namespace


class CRUD(DefinedNamespace):
    _NS = Namespace("https://w3id.org/crud/")
    _fail = True

    ContentType: URIRef

    labelProperty: URIRef
    descriptionProperty: URIRef
    graph: URIRef
    targetClass: URIRef
