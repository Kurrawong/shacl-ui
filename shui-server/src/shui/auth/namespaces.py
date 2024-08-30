from rdflib import URIRef
from rdflib.namespace import DefinedNamespace, Namespace


class OLIS(DefinedNamespace):
    _NS = Namespace("https://olis.dev/")
    _fail = True

    User: URIRef

    hashedPassword: URIRef
    isActive: URIRef
    isSuperuser: URIRef
    isVerified: URIRef
