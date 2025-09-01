import { ref, provide, inject, type Ref, watch } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import TermSet from '@rdfjs/term-set'

const PredicateTrackerKey = Symbol('PredicateTracker')

export function createPredicateTracker(
  initialPredicates: Readonly<Ref<NamedNode[]>>,
  nodeShape: Readonly<Ref<NamedNode | BlankNode | null>>,
) {
  const predicatePaths = ref<TermSet<NamedNode>>(new TermSet(initialPredicates.value))

  watch(
    [initialPredicates, nodeShape],
    ([newPredicates]) => {
      predicatePaths.value = new TermSet(newPredicates)
    },
    { immediate: true },
  )

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
