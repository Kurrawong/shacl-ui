import rdf from 'rdf-ext'
import type { NamespaceBuilder } from 'rdfjs__namespace'

export const dash: NamespaceBuilder = rdf.namespace('http://datashapes.org/dash/')
export const rdfs: NamespaceBuilder = rdf.namespace('http://www.w3.org/2000/01/rdf-schema#')
export const sdo: NamespaceBuilder = rdf.namespace('https://schema.org/')
export const sh: NamespaceBuilder = rdf.namespace('http://www.w3.org/ns/shacl#')
export const xsd: NamespaceBuilder = rdf.namespace('http://www.w3.org/2001/XMLSchema#')
