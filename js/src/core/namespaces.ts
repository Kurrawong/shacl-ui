import $rdf from 'rdf-ext'
import type { NamespaceBuilder } from 'rdfjs__namespace'

export const dash: NamespaceBuilder = $rdf.namespace('http://datashapes.org/dash#')
export const rdf: NamespaceBuilder = $rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
export const rdfs: NamespaceBuilder = $rdf.namespace('http://www.w3.org/2000/01/rdf-schema#')
export const sdo: NamespaceBuilder = $rdf.namespace('https://schema.org/')
export const skos: NamespaceBuilder = $rdf.namespace('http://www.w3.org/2004/02/skos/core#')
export const sh: NamespaceBuilder = $rdf.namespace('http://www.w3.org/ns/shacl#')
export const shx: NamespaceBuilder = $rdf.namespace('http://www.w3.org/ns/shacl-x#')
export const xsd: NamespaceBuilder = $rdf.namespace('http://www.w3.org/2001/XMLSchema#')
