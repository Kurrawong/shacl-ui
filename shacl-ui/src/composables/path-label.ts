import { computed, type ComputedRef } from 'vue'
import type { NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { rdfs, sh } from '@/core/namespaces'
import { useResourceManagerContext } from '@/composables/resource-manager'

type ExtractedPropertyPath = NamedNode | { inverse: NamedNode } | { or: NamedNode[] } | null

/**
 * Extracts a label for a property path using the following priority:
 * 1. rdfs:label from the property path
 * 2. sh:name from the property shape (if provided)
 * 3. Local name extracted from the path IRI
 */
export function usePathLabel(
  path: ComputedRef<ExtractedPropertyPath | NamedNode | null | unknown>,
  propertyShape?: ComputedRef<Shape | undefined>,
): ComputedRef<string> {
  const { shapesGraphPointer } = useResourceManagerContext()

  return computed(() => {
    const pathValue = path.value
    if (!pathValue) {
      return ''
    }

    // 1. Try to get rdfs:label from the property path
    let pathNode: NamedNode | null = null
    if (pathValue && typeof pathValue === 'object' && 'inverse' in pathValue) {
      pathNode = pathValue.inverse as NamedNode
    } else if (pathValue && typeof pathValue === 'object' && 'termType' in pathValue) {
      pathNode = pathValue as NamedNode
    }

    if (pathNode) {
      const rdfsLabels = shapesGraphPointer.value.node(pathNode).out(rdfs.label).terms
      if (rdfsLabels.length) {
        // TODO: preference language tag, then no language tag, then first label
        return rdfsLabels[0].value
      }
    }

    // 2. Fall back to sh:name (if propertyShape is provided)
    if (propertyShape?.value) {
      const shName = propertyShape.value.shapeNodePointer.out(sh`name`).terms
      if (shName.length) {
        // TODO: preference language tag, then no language tag, then first label
        return shName[0].value
      }
    }

    // 3. Last resort: create a label using the current technique of stripping the local name
    if (pathValue && typeof pathValue === 'object' && 'inverse' in pathValue) {
      const inversePath = pathValue.inverse as NamedNode
      return inversePath.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
    }

    // PredicatePath or NamedNode
    const finalPath = pathValue as NamedNode
    return finalPath.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
  })
}
