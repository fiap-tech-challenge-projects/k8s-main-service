import { BudgetEventHandler } from '@application/event-handlers'

describe('BudgetEventHandler', () => {
  let handler: BudgetEventHandler
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

    handler = new BudgetEventHandler(
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

  it('handles BudgetSent and sends email when client exists', async () => {
    const event: any = {
      eventType: 'BudgetSent',
      aggregateId: 'b-1',
      data: { clientId: 'c1', budgetTotal: '100.00', validityPeriod: 7 },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-1', serviceOrderId: 'so-1' },
    })
    mockGetClientByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'c1', email: 'a@a.com', name: 'C' },
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue({ isSuccess: true })

    await handler.handle(event)

    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith(
      'so-1',
      expect.any(String),
      'system',
    )
    expect(mockEmailService.sendBudgetToClient).toHaveBeenCalledWith(
      expect.any(Object),
      'b-1',
      '100.00',
      7,
    )
    expect((handler as any).logger.log).toHaveBeenCalled()
  })

  it('handles BudgetApproved and sends approval email', async () => {
    const event: any = {
      eventType: 'BudgetApproved',
      aggregateId: 'b-2',
      data: { clientId: 'c2', budgetTotal: '200.00' },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-2', serviceOrderId: 'so-2' },
    })
    mockGetClientByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'c2', email: 'b@b.com', name: 'D' },
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue({ isSuccess: true })

    await handler.handle(event)

    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith(
      'so-2',
      expect.any(String),
      'system',
    )
    expect(mockEmailService.sendBudgetApprovalNotification).toHaveBeenCalledWith(
      expect.any(Object),
      'b-2',
      '200.00',
    )
  })

  it('handles BudgetRejected and sends rejection email with reason', async () => {
    const event: any = {
      eventType: 'BudgetRejected',
      aggregateId: 'b-3',
      data: { clientId: 'c3', budgetTotal: '50.00', reason: 'not possible' },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-3', serviceOrderId: 'so-3' },
    })
    mockGetClientByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'c3', email: 'c@c.com', name: 'E' },
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue({ isSuccess: true })

    await handler.handle(event)

    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith(
      'so-3',
      expect.any(String),
      'system',
    )
    expect(mockEmailService.sendBudgetRejectionNotification).toHaveBeenCalledWith(
      expect.any(Object),
      'b-3',
      '50.00',
      'not possible',
    )
  })

  it('warns and returns when budget not found', async () => {
    const event: any = {
      eventType: 'BudgetSent',
      aggregateId: 'missing',
      data: { clientId: 'c1', budgetTotal: '0', validityPeriod: 1 },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('not found'),
    })

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Budget not found: missing'),
    )
    expect(mockEmailService.sendBudgetToClient).not.toHaveBeenCalled()
  })

  it('warns and returns when client not found', async () => {
    const event: any = {
      eventType: 'BudgetSent',
      aggregateId: 'b-4',
      data: { clientId: 'c9', budgetTotal: '0', validityPeriod: 1 },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-4', serviceOrderId: 'so-4' },
    })
    mockGetClientByIdUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no client'),
    })

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalled()
    expect(mockEmailService.sendBudgetToClient).not.toHaveBeenCalled()
  })

  it('warns on unknown event type', async () => {
    const event: any = { eventType: 'UnknownType', aggregateId: 'x', data: {} }

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalledWith(
      `Unknown event type: ${event.eventType}`,
    )
  })

  it('logs error when getBudgetById throws during BudgetSent', async () => {
    const event: any = {
      eventType: 'BudgetSent',
      aggregateId: 'b-err',
      data: { clientId: 'c1', budgetTotal: '0', validityPeriod: 1 },
    }

    mockGetBudgetByIdUseCase.execute.mockRejectedValue(new Error('boom'))

    await handler.handle(event)

    expect((handler as any).logger.error).toHaveBeenCalled()
    expect(mockEmailService.sendBudgetToClient).not.toHaveBeenCalled()
  })

  it('handles BudgetApproved but warns and does not send email when client missing', async () => {
    const event: any = {
      eventType: 'BudgetApproved',
      aggregateId: 'b-no-client',
      data: { clientId: 'c-missing', budgetTotal: '10.00' },
    }

    mockGetBudgetByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-no-client', serviceOrderId: 'so-x' },
    })
    mockGetClientByIdUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no client'),
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue({ isSuccess: true })

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalled()
    expect(mockEmailService.sendBudgetApprovalNotification).not.toHaveBeenCalled()
  })

  it('getEventType returns BudgetEvents', () => {
    expect(handler.getEventType()).toBe('BudgetEvents')
  })
})
