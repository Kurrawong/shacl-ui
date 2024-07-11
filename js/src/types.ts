import type { SNamedNode, SBlankNode, SLiteral } from '@/shui'
import type {Term} from 'n3'

export type STerm = SNamedNode | SBlankNode | SLiteral

export type SIdentifiedNode = SNamedNode | SBlankNode

export type DropdownOption = { name: string; nameTerm: Term; code: string; codeTerm: Term }
