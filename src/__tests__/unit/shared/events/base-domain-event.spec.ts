import { BaseDomainEvent } from '@shared/events'

describe('BaseDomainEvent', () => {
  it('initializes required properties and accepts constructor args', () => {
    const data = { foo: 'bar' }
    class TestEvent extends BaseDomainEvent {}

    const ev = new TestEvent('agg-1', 'TestEvent', data, 2)

    expect(ev.eventId).toBeDefined()
    expect(ev.aggregateId).toBe('agg-1')
    expect(ev.eventType).toBe('TestEvent')
    expect(ev.timestamp).toBeInstanceOf(Date)
    expect(ev.version).toBe(2)
    expect(ev.data).toBe(data)
  })

  it('defaults version to 1 when not provided', () => {
    const data = { a: 1 }
    class TestEvent2 extends BaseDomainEvent {}

    const ev = new TestEvent2('agg-2', 'AnotherEvent', data)

    expect(ev.version).toBe(1)
    expect(ev.aggregateId).toBe('agg-2')
    expect(ev.data).toBe(data)
  })
})
