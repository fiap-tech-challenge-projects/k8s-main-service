import { ServiceOrderApprovedHandler } from '@application/event-handlers'

describe('ServiceOrderApprovedHandler', () => {
  let handler: ServiceOrderApprovedHandler
  let mockCreateServiceExecutionUseCase: any
  let mockGetBudgetByServiceOrderIdUseCase: any
  let mockGetBudgetItemsUseCase: any
  let mockDecreaseStockUseCase: any
  let mockGetEmployeeByIdUseCase: any

  beforeEach(() => {
    mockCreateServiceExecutionUseCase = { execute: jest.fn() }
    mockGetBudgetByServiceOrderIdUseCase = { execute: jest.fn() }
    mockGetBudgetItemsUseCase = { execute: jest.fn() }
    mockDecreaseStockUseCase = { execute: jest.fn() }
    mockGetEmployeeByIdUseCase = { execute: jest.fn() }

    handler = new ServiceOrderApprovedHandler(
      mockCreateServiceExecutionUseCase,
      mockGetBudgetByServiceOrderIdUseCase,
      mockGetBudgetItemsUseCase,
      mockDecreaseStockUseCase,
      mockGetEmployeeByIdUseCase,
    )

    jest.spyOn((handler as any).logger, 'log').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'warn').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('creates service execution and decreases stock when approved by employee', async () => {
    const event: any = {
      aggregateId: 'so-1',
      data: { approvedBy: 'emp-1', approvedAt: new Date(), clientId: 'c1', vehicleId: 'v1' },
    }

    mockGetEmployeeByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'emp-1' },
    })
    mockCreateServiceExecutionUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'se-1' },
    })
    mockGetBudgetByServiceOrderIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-1' },
    })
    mockGetBudgetItemsUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: [
        { type: 'STOCK_ITEM', stockItemId: 's1', quantity: 2 },
        { type: 'SERVICE', quantity: 1 },
      ],
    })
    mockDecreaseStockUseCase.execute.mockResolvedValue({ isSuccess: true })

    await handler.handle(event)

    expect(mockGetEmployeeByIdUseCase.execute).toHaveBeenCalledWith('emp-1')
    expect(mockCreateServiceExecutionUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ serviceOrderId: 'so-1', mechanicId: 'emp-1' }),
    )
    expect(mockDecreaseStockUseCase.execute).toHaveBeenCalledWith(
      's1',
      2,
      expect.stringContaining('Used for service order so-1'),
    )
    expect((handler as any).logger.log).toHaveBeenCalled()
  })

  it('does not create service execution when approved by client but still decreases stock', async () => {
    const event: any = {
      aggregateId: 'so-2',
      data: { approvedBy: 'client-1', approvedAt: new Date(), clientId: 'c2', vehicleId: 'v2' },
    }

    mockGetEmployeeByIdUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('not an employee'),
    })
    mockGetBudgetByServiceOrderIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'b-2' },
    })
    mockGetBudgetItemsUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: [{ type: 'STOCK_ITEM', stockItemId: 's2', quantity: 1 }],
    })
    mockDecreaseStockUseCase.execute.mockResolvedValue({ isSuccess: true })

    await handler.handle(event)

    expect(mockCreateServiceExecutionUseCase.execute).not.toHaveBeenCalled()
    expect(mockDecreaseStockUseCase.execute).toHaveBeenCalledWith('s2', 1, expect.any(String))
    expect((handler as any).logger.log).toHaveBeenCalled()
  })

  it('warns and returns when no budget is found', async () => {
    const event: any = { aggregateId: 'so-3', data: { approvedBy: 'anyone' } }

    mockGetEmployeeByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'anyone' },
    })
    mockCreateServiceExecutionUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { id: 'se-x' },
    })
    mockGetBudgetByServiceOrderIdUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('no budget'),
    })

    await handler.handle(event)

    expect((handler as any).logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('No budget found for service order so-3'),
    )
    expect(mockDecreaseStockUseCase.execute).not.toHaveBeenCalled()
  })
})
