import { BaseEntity } from '@shared'

class TestEntity extends BaseEntity {}

describe('BaseEntity', () => {
  const createdAt = new Date('2023-01-01T00:00:00.000Z')
  const updatedAt = new Date('2023-01-02T00:00:00.000Z')

  it('should initialize props', () => {
    const e = new TestEntity('a', createdAt, updatedAt)
    expect(e.id).toBe('a')
    expect(e.createdAt).toEqual(createdAt)
    expect(e.updatedAt).toEqual(updatedAt)
  })

  it('equals: false when null/undefined', () => {
    const e = new TestEntity('a', createdAt, updatedAt)
    expect(e.equals(null as unknown as TestEntity)).toBe(false)
    expect(e.equals(undefined as unknown as TestEntity)).toBe(false)
  })

  it('equals: true when same instance', () => {
    const e = new TestEntity('a', createdAt, updatedAt)
    expect(e.equals(e)).toBe(true)
  })

  it('equals: compare id', () => {
    const e1 = new TestEntity('a', createdAt, updatedAt)
    const e2 = new TestEntity('a', createdAt, updatedAt)
    const e3 = new TestEntity('b', createdAt, updatedAt)
    expect(e1.equals(e2)).toBe(true)
    expect(e1.equals(e3)).toBe(false)
  })

  it('hashCode should be deterministic', () => {
    const e1 = new TestEntity('hash-id', createdAt, updatedAt)
    const e2 = new TestEntity('hash-id', createdAt, updatedAt)
    expect(e1.hashCode()).toBe(e2.hashCode())
  })

  it('toString should contain class and id', () => {
    const e = new TestEntity('x', createdAt, updatedAt)
    expect(e.toString()).toBe('TestEntity(id=x)')
  })
})
