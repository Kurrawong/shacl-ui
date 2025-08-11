import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import TermSet from '@rdfjs/term-set'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import type { NamedNode } from '@rdfjs/types'
import { sh } from '@/core/namespaces'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sortWithNulls(a: number | null, b: number | null) {
  if (a === null) {
    return 1
  }
  if (b === null) {
    return -1
  }
  return (a || 0) - (b || 0)
}

export function getSHOrDatatypes(propertyShape: Shape) {
  return new TermSet<NamedNode>(
    Array.from(propertyShape.shapeNodePointer.out(sh.or).list() || [])
      .map((pointer) => pointer.out(sh.datatype).term)
      .filter((term) => term !== undefined && term.termType === 'NamedNode'),
  )
}
