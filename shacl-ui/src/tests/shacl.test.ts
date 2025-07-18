import { describe, it, expect } from 'vitest'
import { getPropertyShapes, normalizePropertyPath } from '@/lib/shacl'
import { DataFactory, Store } from 'n3'
import { sh, skos, foaf, dcterms, schema } from '@/lib/namespaces'

const { namedNode, blankNode, quad } = DataFactory

describe('Test getPropertyShapes', () => {
  it('should return the property shapes of a node shape', () => {
    const nodeShape = namedNode('http://example.com/NodeShape')
    const propertyShape = namedNode('http://example.com/PropertyShape')
    const store = new Store()
    store.add(quad(nodeShape, sh.property, propertyShape))
    const propertyShapes = getPropertyShapes(nodeShape, store)
    expect(propertyShapes).toEqual([propertyShape])
  })
})

describe('Test prototype of a reverse map lookup of a SHACL property path', () => {
  describe('normalizePropertyPath', () => {
    it('should normalize simple predicate paths', () => {
      const store = new Store()
      const path = namedNode(skos.prefLabel.value)
      const normalized = normalizePropertyPath(path, store)
      expect(normalized).toBe(`predicate:${skos.prefLabel.value}`)
    })

    it('should normalize inverse paths', () => {
      const store = new Store()
      const inversePath = blankNode('inverse1')
      store.add(quad(inversePath, sh.inversePath, skos.inScheme))

      const normalized = normalizePropertyPath(inversePath, store)
      expect(normalized).toBe(`inverse:predicate:${skos.inScheme.value}`)
    })

    it('should normalize alternative paths', () => {
      const store = new Store()
      const altPath = blankNode('alt1')
      const listNode = blankNode('list1')
      const listNode2 = blankNode('list2')
      const rdfFirst = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first')
      const rdfRest = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
      const rdfNil = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')

      // Create alternative path: [ sh:alternativePath ( schema:dateCreated dcterms:created ) ]
      store.add(quad(altPath, sh.alternativePath, listNode))
      store.add(quad(listNode, rdfFirst, schema.dateCreated))
      store.add(quad(listNode, rdfRest, listNode2))
      store.add(quad(listNode2, rdfFirst, dcterms.created))
      store.add(quad(listNode2, rdfRest, rdfNil))

      const normalized = normalizePropertyPath(altPath, store)
      // Alternative paths should be sorted for consistent results
      const expected = `alternative:[predicate:${dcterms.created.value},predicate:${schema.dateCreated.value}]`
      expect(normalized).toBe(expected)
    })

    it('should normalize sequence paths', () => {
      const store = new Store()
      const seqNode = blankNode('seq1')
      const seqNode2 = blankNode('seq2')
      const rdfFirst = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first')
      const rdfRest = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
      const rdfNil = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')

      // Create sequence path: ( foaf:knows foaf:name )
      store.add(quad(seqNode, rdfFirst, foaf.knows))
      store.add(quad(seqNode, rdfRest, seqNode2))
      store.add(quad(seqNode2, rdfFirst, foaf.name))
      store.add(quad(seqNode2, rdfRest, rdfNil))

      const normalized = normalizePropertyPath(seqNode, store)
      const expected = `sequence:[predicate:${foaf.knows},predicate:${foaf.name}]`
      expect(normalized).toBe(expected)
    })

    it('should normalize zero-or-more paths', () => {
      const store = new Store()
      const zeroOrMorePath = blankNode('zeroOrMore1')
      store.add(quad(zeroOrMorePath, sh.zeroOrMorePath, foaf.knows))

      const normalized = normalizePropertyPath(zeroOrMorePath, store)
      expect(normalized).toBe(`zeroOrMore:predicate:${foaf.knows.value}`)
    })

    it('should normalize one-or-more paths', () => {
      const store = new Store()
      const oneOrMorePath = blankNode('oneOrMore1')
      store.add(quad(oneOrMorePath, sh.oneOrMorePath, foaf.knows))

      const normalized = normalizePropertyPath(oneOrMorePath, store)
      expect(normalized).toBe(`oneOrMore:predicate:${foaf.knows.value}`)
    })

    it('should normalize zero-or-one paths', () => {
      const store = new Store()
      const zeroOrOnePath = blankNode('zeroOrOne1')
      store.add(quad(zeroOrOnePath, sh.zeroOrOnePath, foaf.knows))

      const normalized = normalizePropertyPath(zeroOrOnePath, store)
      expect(normalized).toBe(`zeroOrOne:predicate:${foaf.knows.value}`)
    })

    it('should handle nested inverse paths', () => {
      const store = new Store()
      const nestedPath = blankNode('nested1')
      const innerPath = blankNode('inner1')

      // Create nested structure: [ sh:inversePath [ sh:inversePath foaf:knows ] ]
      store.add(quad(nestedPath, sh.inversePath, innerPath))
      store.add(quad(innerPath, sh.inversePath, foaf.knows))

      const normalized = normalizePropertyPath(nestedPath, store)
      expect(normalized).toBe(`inverse:inverse:predicate:${foaf.knows.value}`)
    })
  })
})
