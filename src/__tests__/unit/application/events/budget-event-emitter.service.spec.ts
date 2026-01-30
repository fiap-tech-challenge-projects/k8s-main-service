import { Logger } from '@nestjs/common'

import { BudgetEventEmitterService } from '@application/events/budget-event-emitter.service'
import { BudgetSentEvent, BudgetApprovedEvent, BudgetRejectedEvent } from '@domain/budget/events'

describe('BudgetEventEmitterService (pure unit)', () => {
  let svc: BudgetEventEmitterService
  const mockGetClientById = { execute: jest.fn() }
  const mockEventBus = { publish: jest.fn() }

  const budget = {
    id: 'b-1',
    clientId: 'c-1',
    totalAmount: 123.45,
    getFormattedTotalAmount: () => '123.45',
    validityPeriod: 30,
  }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)

    mockGetClientById.execute.mockReset()
    mockEventBus.publish.mockReset()

    svc = new BudgetEventEmitterService(
      // minimal mock cast to expected type
      mockGetClientById as unknown as any,
      // minimal mock cast to expected type
      mockEventBus as unknown as any,
    )
  })

  afterAll(() => jest.restoreAllMocks())

  it('emits BudgetSent with unknown client when client not found', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: false,
    })

    await svc.emitBudgetSentEvent(budget as any)

    expect(mockEventBus.publish).toHaveBeenCalled()
    const published = mockEventBus.publish.mock.calls[0][0]
    expect(published).toBeInstanceOf(BudgetSentEvent)
    // BaseDomainEvent stores event data in `.data`
    expect((published as any).data.clientName).toBe('Unknown')
  })

  it('emits BudgetSent with client data when client found', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: true,
      value: {
        id: 'c-1',
        name: 'x',
        email: 'x@e',
      },
    })

    await svc.emitBudgetSentEvent(budget as any)

    expect(mockEventBus.publish).toHaveBeenCalled()
    const published = mockEventBus.publish.mock.calls[0][0]
    expect(published).toBeInstanceOf(BudgetSentEvent)
    expect((published as any).data.clientName).toBe('x')
  })

  it('logs error when eventBus.publish throws in emitBudgetSentEvent', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: true,
      value: {
        id: 'c-1',
        name: 'x',
        email: 'x@e',
      },
    })
    mockEventBus.publish.mockRejectedValue(new Error('boom'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    await svc.emitBudgetSentEvent(budget as any)

    expect(errSpy).toHaveBeenCalled()
  })

  it('does not publish BudgetApproved when client not found', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: false,
    })

    await svc.emitBudgetApprovedEvent(budget as any)

    expect(mockEventBus.publish).not.toHaveBeenCalled()
  })

  it('publishes BudgetApproved when client found', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: true,
      value: {
        id: 'c-1',
        name: 'n',
        email: 'e',
      },
    })

    await svc.emitBudgetApprovedEvent(budget as any)

    expect(mockEventBus.publish).toHaveBeenCalled()
    const published = mockEventBus.publish.mock.calls[0][0]
    expect(published).toBeInstanceOf(BudgetApprovedEvent)
  })

  it('logs error when eventBus.publish throws in emitBudgetApprovedEvent', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: true,
      value: {
        id: 'c-1',
        name: 'n',
        email: 'e',
      },
    })
    mockEventBus.publish.mockRejectedValue(new Error('boom'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    await svc.emitBudgetApprovedEvent(budget as any)

    expect(errSpy).toHaveBeenCalled()
  })

  it('does not publish BudgetRejected when client not found', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: false,
    })

    await svc.emitBudgetRejectedEvent(budget as any, 'reason')

    expect(mockEventBus.publish).not.toHaveBeenCalled()
  })

  it('publishes BudgetRejected when client found', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: true,
      value: {
        id: 'c-1',
        name: 'n',
        email: 'e',
      },
    })

    await svc.emitBudgetRejectedEvent(budget as any, 'reason')

    expect(mockEventBus.publish).toHaveBeenCalled()
    const published = mockEventBus.publish.mock.calls[0][0]
    expect(published).toBeInstanceOf(BudgetRejectedEvent)
  })

  it('logs error when eventBus.publish throws in emitBudgetRejectedEvent', async () => {
    mockGetClientById.execute.mockResolvedValue({
      isSuccess: true,
      value: {
        id: 'c-1',
        name: 'n',
        email: 'e',
      },
    })
    mockEventBus.publish.mockRejectedValue(new Error('boom'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    await svc.emitBudgetRejectedEvent(budget as any, 'reason')

    expect(errSpy).toHaveBeenCalled()
  })
})
