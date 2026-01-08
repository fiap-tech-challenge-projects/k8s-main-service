import { BudgetController } from '@interfaces/rest/controllers'

describe('BudgetController additional branches', () => {
  let controller: any

  beforeEach(() => {
    const mockCreate = { execute: jest.fn() }
    const mockGetById = { execute: jest.fn() }
    const mockApprove = { execute: jest.fn() }
    const mockReject = { execute: jest.fn() }
    const mockGetAll = { execute: jest.fn() }
    const mockGetByClientName = { execute: jest.fn() }
    const mockGetByIdWithItems = { execute: jest.fn() }
    const mockSend = { execute: jest.fn() }
    const mockMark = { execute: jest.fn() }
    const mockCheck = { execute: jest.fn() }
    const mockUpdate = { execute: jest.fn() }
    const mockDelete = { execute: jest.fn() }
    const mockPresenter = { present: jest.fn() }

    controller = new BudgetController(
      mockCreate as any,
      mockGetById as any,
      mockApprove as any,
      mockReject as any,
      mockGetAll as any,
      mockGetByClientName as any,
      mockGetByIdWithItems as any,
      mockSend as any,
      mockMark as any,
      mockCheck as any,
      mockUpdate as any,
      mockDelete as any,
      mockPresenter as any,
    )

    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.clearAllMocks())

  it('searchByClientName returns value when use case succeeds', async () => {
    const payload = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    ;(controller as any).getBudgetByClientNameUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: payload,
    } as any)

    const out = await controller.searchByClientName('acme')
    expect(out).toBe(payload)
  })

  it('searchByClientName throws when use case rejects', async () => {
    ;(controller as any).getBudgetByClientNameUseCase.execute.mockRejectedValue(new Error('db'))

    await expect(controller.searchByClientName('acme')).rejects.toThrow('db')
  })

  it('markAsReceived returns presented value when success', async () => {
    const presented = { id: 'b-1' }
    ;(controller as any).markBudgetAsReceivedUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: { expired: false },
    } as any)
    ;(controller as any).budgetPresenter.present.mockReturnValue(presented)

    const out = await controller.markAsReceived('b-1')
    expect(out).toBe(presented)
  })

  it('delete throws when use case returns Failure', async () => {
    ;(controller as any).deleteBudgetUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('not found'),
    } as any)

    await expect(controller.delete('b-1')).rejects.toThrow('not found')
  })

  it('create throws and logs when use case returns Failure', async () => {
    ;(controller as any).createBudgetUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('create failed'),
    } as any)

    await expect(controller.create({} as any)).rejects.toThrow('create failed')
    expect(controller['logger'].error).toHaveBeenCalled()
  })

  it('getById throws and logs when use case returns Failure', async () => {
    ;(controller as any).getBudgetByIdUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('not found'),
    } as any)

    await expect(controller.getById('b-1')).rejects.toThrow('not found')
    expect(controller['logger'].error).toHaveBeenCalled()
  })

  it('getByIdWithItems throws and logs when use case returns Failure', async () => {
    ;(controller as any).getBudgetByIdWithItemsUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('not found with items'),
    } as any)

    await expect(controller.getByIdWithItems('b-1')).rejects.toThrow('not found with items')
    expect(controller['logger'].error).toHaveBeenCalled()
  })

  it('approve/reject/send/update throw and log when use cases return Failure', async () => {
    ;(controller as any).approveBudgetUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('approve err'),
    } as any)
    ;(controller as any).rejectBudgetUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('reject err'),
    } as any)
    ;(controller as any).sendBudgetUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('send err'),
    } as any)
    ;(controller as any).updateBudgetUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('update err'),
    } as any)

    await expect(controller.approve('b-1')).rejects.toThrow('approve err')
    expect(controller['logger'].error).toHaveBeenCalled()

    await expect(controller.reject('b-1')).rejects.toThrow('reject err')
    expect(controller['logger'].error).toHaveBeenCalled()

    await expect(controller.send('b-1')).rejects.toThrow('send err')
    expect(controller['logger'].error).toHaveBeenCalled()

    await expect(controller.update('b-1', {} as any)).rejects.toThrow('update err')
    expect(controller['logger'].error).toHaveBeenCalled()
  })

  it('getAllBudget throws and logs when use case returns Failure', async () => {
    ;(controller as any).getAllBudgetsUseCase.execute.mockResolvedValue({
      isFailure: true,
      error: new Error('getall err'),
    } as any)

    await expect(controller.getAllBudget(1, 10)).rejects.toThrow('getall err')
    expect(controller['logger'].error).toHaveBeenCalled()
  })

  it('markAsReceived logs and throws when use case rejects', async () => {
    ;(controller as any).markBudgetAsReceivedUseCase.execute.mockRejectedValue(new Error('boom'))

    await expect(controller.markAsReceived('b-1')).rejects.toThrow('boom')
    expect(controller['logger'].error).toHaveBeenCalled()
  })

  it('delete logs and throws when use case rejects', async () => {
    ;(controller as any).deleteBudgetUseCase.execute.mockRejectedValue(new Error('del boom'))

    await expect(controller.delete('b-1')).rejects.toThrow('del boom')
    expect(controller['logger'].error).toHaveBeenCalled()
  })
})
