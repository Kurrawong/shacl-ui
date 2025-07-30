import type { NamedNode, BlankNode } from '@rdfjs/types'
import n3 from 'n3'
import { sh } from '@/core/namespaces'

abstract class ConstraintComponent {
  _shapeNode: NamedNode | BlankNode
  _store: n3.Store

  constructor(shapeNode: NamedNode | BlankNode, store: n3.Store) {
    this._shapeNode = shapeNode
    this._store = store
  }

  /**
   * The constraint component IRI.
   */
  abstract type(): NamedNode
}

export class ClassConstraintComponent extends ConstraintComponent {
  _classes: NamedNode[]

  constructor(shapeNode: NamedNode | BlankNode, store: n3.Store) {
    super(shapeNode, store)

    const parameterValues = store.getObjects(shapeNode, sh.class, null)
    if (parameterValues.length === 0) {
      throw new Error('sh:ClassConstraintComponent must have at least one sh:class parameter.')
    }
    this._classes = parameterValues.map((value) => {
      if (value.termType !== 'NamedNode') {
        throw new Error('sh:class parameter must be an IRI.')
      }
      return value
    })
  }

  type(): NamedNode {
    return sh.ClassConstraintComponent
  }

  classes(): NamedNode[] {
    return this._classes
  }
}
