import type { Store, NamedNode, BlankNode } from 'n3'

export class Shape {
  id: NamedNode | BlankNode
  store: Store

  constructor(id: NamedNode | BlankNode, store: Store) {
    this.id = id
    this.store = store
  }
}
