import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode

export const DATA_GRAPH = namedNode('urn:graph:data')
export const SHACL_GRAPH = namedNode("urn:system:graph:shacl")