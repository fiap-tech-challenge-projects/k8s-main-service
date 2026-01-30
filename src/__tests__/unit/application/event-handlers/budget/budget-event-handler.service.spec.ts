import { BudgetEventHandler as BudgetEventHandlerService } from '@application/event-handlers/budget/budget-event-handler.service'

describe('BudgetEventHandler Service (unit)', () => {
  let handler: any
  let mockEmailService: any
  let mockGetClientByIdUseCase: any
  let mockUpdateServiceOrderStatusUseCase: any
  let mockGetBudgetByIdUseCase: any

  beforeEach(() => {
    mockEmailService = {
      sendBudgetToClient: jest.fn(),
      sendBudgetApprovalNotification: jest.fn(),
      sendBudgetRejectionNotification: jest.fn(),
    }
    mockGetClientByIdUseCase = { execute: jest.fn() }
    mockUpdateServiceOrderStatusUseCase = { execute: jest.fn() }
    mockGetBudgetByIdUseCase = { execute: jest.fn() }

    handler = new BudgetEventHandlerService(
      mockEmailService,
      mockGetClientByIdUseCase,
      mockUpdateServiceOrderStatusUseCase,
      mockGetBudgetByIdUseCase,
    )

    jest.spyOn((handler as any).logger, 'log').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'warn').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('handles BudgetSent happy path', async () => {
    const event: any = {
      eventType: 'BudgetSent',
      aggregateId: 'b-svc-1',
      data: { clientId: 'c1', budgetTotal: '100', validityPeriod: 5 },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-svc-1', serviceOrderId: 'so-1' },
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue({ isSuccess: true })
    mockGetClientByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'c1', email: 'x@y.com' },
    })

    await handler.handle(event)

    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalled()
    expect(mockEmailService.sendBudgetToClient).toHaveBeenCalled()
  })

  it('handles BudgetApproved and warns when client missing', async () => {
    const event: any = {
      eventType: 'BudgetApproved',
      aggregateId: 'b-2',
      data: { clientId: 'cm', budgetTotal: '50' },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-2', serviceOrderId: 'so-2' },
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue({ isSuccess: true })
    mockGetClientByIdUseCase.execute.mockResolvedValue({ isSuccess: false, error: new Error('no') })

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalled()
    expect(mockEmailService.sendBudgetApprovalNotification).not.toHaveBeenCalled()
  })

  it('handles BudgetRejected and returns when budget missing', async () => {
    const event: any = {
      eventType: 'BudgetRejected',
      aggregateId: 'missing',
      data: { clientId: 'c', budgetTotal: '0' },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('not found'),
    })

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalled()
    expect(mockEmailService.sendBudgetRejectionNotification).not.toHaveBeenCalled()
  })

  it('warns on unknown type', async () => {
    const event: any = { eventType: 'Nothing', aggregateId: 'x', data: {} }

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalledWith(
      `Unknown event type: ${event.eventType}`,
    )
  })
})
