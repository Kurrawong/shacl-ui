import type { Quad_Subject, Store } from 'n3'
import { NamedNode } from 'n3'
import { skos } from '@/core/namespaces.js'

export function getConceptLabel(iri: Quad_Subject | NamedNode, store: Store) {
  const labels = store.getObjects(iri, skos.prefLabel, null)
  if (labels && labels.length > 0) {
    return labels[0].value
  }
  return iri.value
}
