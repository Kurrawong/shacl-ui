import { Store, Parser } from 'n3'
import clownface, { type AnyPointer } from 'clownface'
import vocab from '@/assets/dash.ttl?raw'

let dashVocab: AnyPointer | null = null

const dashVocabularyFactory = () => {
  if (dashVocab) return dashVocab

  const parser = new Parser()
  const quads = parser.parse(vocab)
  const store = new Store()
  store.addQuads(quads)
  dashVocab = clownface({ dataset: store })
  return dashVocab
}

export default dashVocabularyFactory
