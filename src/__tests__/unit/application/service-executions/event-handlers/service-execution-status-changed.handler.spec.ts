import { ServiceExecutionStatusChangedHandler } from '@application/event-handlers'

describe('ServiceExecutionStatusChangedHandler', () => {
  let handler: ServiceExecutionStatusChangedHandler
  let mockGetServiceOrderByIdUseCase: any
  let mockUpdateServiceOrderStatusUseCase: any

  beforeEach(() => {
    mockGetServiceOrderByIdUseCase = { execute: jest.fn() }
    mockUpdateServiceOrderStatusUseCase = { execute: jest.fn() }
    handler = new ServiceExecutionStatusChangedHandler(
      mockGetServiceOrderByIdUseCase,
      mockUpdateServiceOrderStatusUseCase,
    )
    jest.spyOn((handler as any).logger, 'log').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('does nothing when status change does not require update', async () => {
    const event = {
      data: {
        previousStatus: 'ASSIGNED',
        newStatus: 'ASSIGNED',
        serviceOrderId: 'so1',
        changedBy: 'user1',
      },
    }

    await handler.handle(event as any)

    expect(mockUpdateServiceOrderStatusUseCase.execute).not.toHaveBeenCalled()
  })

  it('updates service order to IN_EXECUTION when execution in progress', async () => {
    const event = {
      data: {
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        serviceOrderId: 'so2',
        changedBy: 'user2',
      },
    }

    mockGetServiceOrderByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { status: 'ASSIGNED' },
    })

    await handler.handle(event as any)

    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith(
      'so2',
      expect.anything(),
      'user2',
    )
  })

  it('updates service order to FINISHED when execution completed', async () => {
    const event = {
      data: {
        previousStatus: 'IN_PROGRESS',
        newStatus: 'COMPLETED',
        serviceOrderId: 'so3',
        changedBy: 'user3',
      },
    }

    mockGetServiceOrderByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { status: 'IN_PROGRESS' },
    })

    await handler.handle(event as any)

    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith(
      'so3',
      expect.anything(),
      'user3',
    )
  })

  it('logs and continues if getServiceOrderById throws during status update flow', async () => {
    const event = {
      data: {
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        serviceOrderId: 'so4',
        changedBy: 'user4',
      },
    }

    mockGetServiceOrderByIdUseCase.execute.mockRejectedValue(new Error('db fail'))

    await handler.handle(event as any)

    // even if getting current status fails, update should still be attempted
    expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalled()
    expect((handler as any).logger.error).toHaveBeenCalled()
  })

  it('throws and logs when updateServiceOrderStatusUseCase throws', async () => {
    const event = {
      data: {
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        serviceOrderId: 'so5',
        changedBy: 'user5',
      },
    }

    mockGetServiceOrderByIdUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { status: 'ASSIGNED' },
    })
    mockUpdateServiceOrderStatusUseCase.execute.mockRejectedValue(new Error('update fail'))

    await expect(handler.handle(event as any)).rejects.toThrow('update fail')
    expect((handler as any).logger.error).toHaveBeenCalled()
  })
})
