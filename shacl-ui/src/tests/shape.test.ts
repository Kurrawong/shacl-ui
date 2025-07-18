import { describe, it, expect } from 'vitest'
import { DataFactory, Store } from 'n3'
import { Shape } from '@/lib/shape'

const { namedNode, blankNode } = DataFactory

describe('Shape', () => {
  it('should create a Shape instance with NamedNode id', () => {
    const store = new Store()
    const id = namedNode('https://example.com/test')
    const shape = new Shape(id, store)

    expect(shape.id).toBe(id)
    expect(shape.store).toBe(store)
  })

  it('should create a Shape instance with BlankNode id', () => {
    const store = new Store()
    const id = blankNode('test-blank')
    const shape = new Shape(id, store)

    expect(shape.id).toBe(id)
    expect(shape.store).toBe(store)
  })

  it('should have correct property types', () => {
    const store = new Store()
    const id = namedNode('https://example.com/test')
    const shape = new Shape(id, store)

    expect(shape.id).toBeDefined()
    expect(shape.store).toBeDefined()
    expect(typeof shape.id).toBe('object')
    expect(typeof shape.store).toBe('object')
  })

  it('should work with different store instances', () => {
    const store1 = new Store()
    const store2 = new Store()
    const id = namedNode('https://example.com/test')

    const shape1 = new Shape(id, store1)
    const shape2 = new Shape(id, store2)

    expect(shape1.store).toBe(store1)
    expect(shape2.store).toBe(store2)
    expect(shape1.store).not.toBe(shape2.store)
  })
})
