import { ref, provide, inject } from 'vue'
import type { NamedNode } from '@rdfjs/types'
import TermSet from '@rdfjs/term-set'

const PredicateTrackerKey = Symbol('PredicateTracker')

export function providePredicateTracker(initialPredicates: NamedNode[]) {
  const predicatePaths = ref<TermSet<NamedNode>>(new TermSet(initialPredicates))

  function registerHandledPredicate(predicate: NamedNode) {
    predicatePaths.value.delete(predicate)
  }

  function getPredicates() {
    return Array.from(predicatePaths.value) as NamedNode[]
  }

  provide(PredicateTrackerKey, {
    registerHandledPredicate,
    getPredicates,
  })

  return {
    registerHandledPredicate,
    getPredicates,
  }
}

export function usePredicateTrackerContext() {
  const predicateTracker = inject<{
    registerHandledPredicate: (predicate: NamedNode) => void
    getPredicates: () => NamedNode[]
  }>(PredicateTrackerKey)
  if (!predicateTracker) {
    throw new Error('PredicateTracker not found')
  }
  return predicateTracker
}
