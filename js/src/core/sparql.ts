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
import { Store, type Quad_Graph } from 'n3'

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
  classes: NamedNode[],
  shaclGraphName: NamedNode | BlankNode | null
) {
  // TODO: Get the concise bounded description of the shape in its own dataset.
  //       Then, add $rdf.quad(term, rdf.type, sh.NodeShape, null) to it.
  //       We need to ensure the rdf:type statement is there for the constructQuery
  //       function to work correctly.

  const statement = $rdf.quad(shape, rdf.type, sh.NodeShape, shaclGraphName as Quad_Graph)

  const store = new Store()
  store.add(statement)

  for (const quad of dataset.match(null, null, null, shaclGraphName as Quad_Graph)) {
    store.addQuad(quad)
  }

  const ptr: GraphPointer = $rdf.clownface({ dataset: store, term: shape })
  for (const cls of classes) {
    ptr.addOut(sh.property, (property) => {
      property.addOut(sh.path, rdf.type).addOut(sh.hasValue, cls)
    })
  }

  return constructQuery(ptr)
}

export function rewriteSparqlAutoComplete(
  query: string,
  labelProperty: NamedNode | null,
  graphName: NamedNode | BlankNode,
  search: string = ''
) {
  const ast = parser.parse(query) as sparqljs.SparqlQuery & {
    from: {
      default: Array<{ termType: string; value: string }>
      named: any[]
    }
    where: any[]
    limit?: number
  }

  ast['from'] = {
    default: [
      {
        termType: graphName.termType,
        value: graphName.value
      }
    ],
    named: []
  }

  if (search && labelProperty) {
    // label
    ast.where.push({
      type: 'bgp',
      triples: [
        {
          subject: $rdf.variable('resource1'),
          predicate: labelProperty,
          object: $rdf.variable('label')
        }
      ]
    })

    // filter
    ast.where.push({
      type: 'filter',
      expression: {
        type: 'operation',
        operator: 'regex',
        args: [
          {
            type: 'operation',
            operator: 'str',
            args: [$rdf.variable('label')]
          },
          $rdf.literal(`^${search}`),
          $rdf.literal('i')
        ]
      }
    })
  }

  ast.limit = 100

  return generator.stringify(ast)
}
