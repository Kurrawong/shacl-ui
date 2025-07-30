import { QueryEngine } from '@comunica/query-sparql-rdfjs-lite'
import type { NamedNode, BlankNode, Term } from '@rdfjs/types'
import n3 from 'n3'
import { sh } from '@/core/namespaces'

export async function sparqlQuery(query: string, store: n3.Store) {
  const engine = new QueryEngine()
  const result = await engine.queryBindings(query, {
    sources: [store],
  })
  return result.toArray()
}

export function getPropertyShapes(
  nodeShape: NamedNode | BlankNode,
  shapesGraph: n3.Store,
): (NamedNode | BlankNode)[] {
  // TODO: there are other ways to obtain property shapes, such as using logical constraint components or SPARQL-based constraint components.
  return shapesGraph
    .getObjects(nodeShape, sh.property, null)
    .filter(
      (propertyShape) =>
        propertyShape.termType === 'NamedNode' || propertyShape.termType === 'BlankNode',
    )
}

export function getPropertyGroups(
  propertyShapes: (NamedNode | BlankNode)[],
  shapesGraph: n3.Store,
): (NamedNode | BlankNode)[] {
  const propertyGroupsSeen = new Set<string>()
  const propertyGroups: (NamedNode | BlankNode)[] = []
  for (const propertyShape of propertyShapes) {
    const propertyGroupValues = shapesGraph
      .getObjects(propertyShape, sh.group, null)
      .filter(
        (propertyGroup) =>
          propertyGroup.termType === 'NamedNode' || propertyGroup.termType === 'BlankNode',
      )
    for (const propertyGroupValue of propertyGroupValues) {
      if (!propertyGroupsSeen.has(propertyGroupValue.value)) {
        propertyGroupsSeen.add(propertyGroupValue.value)
        propertyGroups.push(propertyGroupValue)
      }
    }
  }
  return propertyGroups
}

/**
 * Normalizes a SHACL property path into a canonical string representation
 * that can be used as a map key for aggregating property shapes.
 */
export function normalizePropertyPath(pathTerm: Term, store: n3.Store): string {
  if (pathTerm.termType === 'NamedNode') {
    // Simple predicate path
    return `predicate:${pathTerm.value}`
  }

  if (pathTerm.termType === 'BlankNode') {
    // Complex property path - check what type it is

    // Inverse path: [ sh:inversePath pred ]
    const inverseValues = store.getObjects(pathTerm, sh.inversePath, null)
    if (inverseValues.length > 0) {
      const innerPath = normalizePropertyPath(inverseValues[0], store)
      return `inverse:${innerPath}`
    }

    // Alternative path: [ sh:alternativePath ( pred1 pred2 ... ) ]
    const alternativeValues = store.getObjects(pathTerm, sh.alternativePath, null)
    if (alternativeValues.length > 0) {
      const listItems = getRDFListItems(alternativeValues[0], store)
      const normalizedItems = listItems.map((item) => normalizePropertyPath(item, store)).sort()
      return `alternative:[${normalizedItems.join(',')}]`
    }

    // Sequence path: ( pred1 pred2 ... )
    const listItems = getRDFListItems(pathTerm, store)
    if (listItems.length > 0) {
      const normalizedItems = listItems.map((item) => normalizePropertyPath(item, store))
      return `sequence:[${normalizedItems.join(',')}]`
    }

    // Zero-or-more path: [ sh:zeroOrMorePath pred ]
    const zeroOrMoreValues = store.getObjects(pathTerm, sh.zeroOrMorePath, null)
    if (zeroOrMoreValues.length > 0) {
      const innerPath = normalizePropertyPath(zeroOrMoreValues[0], store)
      return `zeroOrMore:${innerPath}`
    }

    // One-or-more path: [ sh:oneOrMorePath pred ]
    const oneOrMoreValues = store.getObjects(pathTerm, sh.oneOrMorePath, null)
    if (oneOrMoreValues.length > 0) {
      const innerPath = normalizePropertyPath(oneOrMoreValues[0], store)
      return `oneOrMore:${innerPath}`
    }

    // Zero-or-one path: [ sh:zeroOrOnePath pred ]
    const zeroOrOneValues = store.getObjects(pathTerm, sh.zeroOrOnePath, null)
    if (zeroOrOneValues.length > 0) {
      const innerPath = normalizePropertyPath(zeroOrOneValues[0], store)
      return `zeroOrOne:${innerPath}`
    }

    // If we can't identify the path type, use the blank node ID
    return `unknown:${pathTerm.value}`
  }

  return `literal:${pathTerm.value}`
}

/**
 * Extracts items from an RDF list (rdf:List structure)
 */
function getRDFListItems(listHead: Term, store: n3.Store): Term[] {
  const items: Term[] = []
  let current = listHead

  while (current && current.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil') {
    // Get rdf:first
    const firstValues = store.getObjects(
      current,
      n3.DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
      null,
    )
    if (firstValues.length > 0) {
      items.push(firstValues[0])
    }

    // Get rdf:rest for next iteration
    const restValues = store.getObjects(
      current,
      n3.DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
      null,
    )
    if (restValues.length > 0) {
      current = restValues[0]
    } else {
      break
    }
  }

  return items
}
