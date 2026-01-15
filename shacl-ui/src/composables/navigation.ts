import { inject, provide } from 'vue'
import type { NamedNode } from '@rdfjs/types'

const NavigationKey = Symbol('Navigation')

export function provideNavigation(onNavigate: (resource: NamedNode) => void) {
  provide(NavigationKey, {
    navigate: onNavigate,
  })

  return {
    navigate: onNavigate,
  }
}

export function useNavigationContext() {
  const navigation = inject<{
    navigate: (resource: NamedNode) => void
  }>(NavigationKey)

  if (!navigation) {
    throw new Error('Navigation context not found')
  }

  return navigation
}
