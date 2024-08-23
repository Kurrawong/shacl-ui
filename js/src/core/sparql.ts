import { constructQuery } from '@hydrofoil/shape-to-query'
import type { BlankNode, DatasetCore, NamedNode } from '@rdfjs/types'
import { DatasetFactory, Environment, NamespaceFactory } from 'rdf-ext'
import DataFactory from '@rdfjs/data-model/Factory'
import ClownfaceFactory from 'clownface/Factory'
import type { GraphPointer } from 'clownface'
import sparqljs from 'sparqljs'

import { rdf, sh } from '@/core/namespaces'
import SparqlParser = sparqljs.Parser
import SparqlGenerator = sparqljs.Generator

const $rdf = new Environment([NamespaceFactory, DatasetFactory, DataFactory, ClownfaceFactory])
const parser = new SparqlParser()
const generator = new SparqlGenerator()

/**
 * Convert a SHACL NodeShape to a SPARQL construct query.
 * @param shape The shape term.
 * @param dataset The dataset.
 * @param shaclGraphName The graph name containing the SHACL definitions.
 */
export function shapeToSparql(
  shape: NamedNode | BlankNode,
  dataset: DatasetCore,
  shaclGraphName: NamedNode | BlankNode | null
) {
  // TODO: Get the concise bounded description of the shape in its own dataset.
  //       Then, add $rdf.quad(term, rdf.type, sh.NodeShape, null) to it.
  //       We need to ensure the rdf:type statement is there for the constructQuery
  //       function to work correctly.

  const statement = $rdf.quad(shape, rdf.type, sh.NodeShape, shaclGraphName)
  dataset.add(statement)
  const ptr: GraphPointer = $rdf.clownface({ dataset, term: shape })
  return constructQuery(ptr)
}

export function sparqlAutoCompleteRewrite(
  query: string,
  classes: NamedNode[],
  graphName: NamedNode | BlankNode
) {
  const ast = parser.parse(query)
  ast['from'] = {
    default: [
      {
        termType: graphName.termType,
        value: graphName.value
      }
    ],
    named: []
  }

  const where = ast['where']
  if (where.length) {
    const triples = where[0]?.['triples']
    if (triples.length) {
      for (const c of classes) {
        triples.push({
          subject: {
            termType: 'Variable',
            value: 'resource1'
          },
          predicate: {
            termType: 'NamedNode',
            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          },
          object: {
            termType: 'NamedNode',
            value: c.value
          }
        })
      }
    }
  } else {
    throw Error()
  }

  return generator.stringify(ast)
}
