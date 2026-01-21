import { InMemoryEventBus } from '@shared/events'

describe('InMemoryEventBus', () => {
  let bus: InMemoryEventBus

  beforeEach(() => {
    bus = new InMemoryEventBus()
  })

  it('subscribes and publishes to handlers', async () => {
    const handler = { handle: jest.fn() }

    await bus.subscribe('TEST_EVENT', handler as any)

    await bus.publish({
      eventType: 'TEST_EVENT',
      payload: { a: 1 },
    } as any)

    expect(handler.handle).toHaveBeenCalledTimes(1)
    expect(handler.handle).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'TEST_EVENT' }),
    )
  })

  it('does not fail when no handlers are registered', async () => {
    await expect(bus.publish({ eventType: 'NO_HANDLERS' } as any)).resolves.toBeUndefined()
  })

  it('handles handler errors without throwing', async () => {
    const handler = { handle: jest.fn().mockRejectedValue(new Error('boom')) }

    await bus.subscribe('ERR_EVENT', handler as any)

    await expect(bus.publish({ eventType: 'ERR_EVENT' } as any)).resolves.toBeUndefined()
    expect(handler.handle).toHaveBeenCalled()
  })

  it('prevents duplicate handler registration', async () => {
    const handler = { handle: jest.fn() }

    await bus.subscribe('DUP', handler as any)
    // second subscribe should be a no-op and not add duplicate
    await bus.subscribe('DUP', handler as any)

    await bus.publish({ eventType: 'DUP' } as any)
    expect(handler.handle).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes handlers', async () => {
    const handler = { handle: jest.fn() }

    await bus.subscribe('TO_REMOVE', handler as any)
    await bus.unsubscribe('TO_REMOVE', handler as any)

    await expect(bus.publish({ eventType: 'TO_REMOVE' } as any)).resolves.toBeUndefined()
    expect(handler.handle).not.toHaveBeenCalled()
  })
})
