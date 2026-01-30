/* eslint-disable import/no-internal-modules */
import { ClientBudgetsController } from '@interfaces/rest/controllers/client-portal/client-budgets.controller'

describe('ClientBudgetsController (unit)', () => {
  const getBudgetsUseCase: any = { execute: jest.fn() }
  const getBudgetWithItemsUseCase: any = { execute: jest.fn() }
  const approveUseCase: any = { execute: jest.fn() }
  const rejectUseCase: any = { execute: jest.fn() }
  const checkExpireUseCase: any = { execute: jest.fn() }
  const getBudgetItemsUseCase: any = { execute: jest.fn() }
  const presenter: any = {}

  beforeEach(() => jest.clearAllMocks())

  it('getBudgetsByClient returns value on success', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    const payload = { data: [], meta: {} }
    getBudgetsUseCase.execute.mockResolvedValue({ isSuccess: true, value: payload })

    const res = await controller.getBudgetsByClient('c-1', { page: 1, limit: 10 } as any)
    expect(getBudgetsUseCase.execute).toHaveBeenCalledWith('c-1', 1, 10)
    expect(res).toEqual(payload)
  })

  it('throws when use case promise rejects', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    const err = new Error('fatal')
    getBudgetsUseCase.execute.mockRejectedValue(err)

    await expect(
      controller.getBudgetsByClient('client-1', { page: 1, limit: 10 } as any),
    ).rejects.toBe(err)
  })

  it('throws when use case fails', async () => {
    getBudgetsUseCase.execute.mockResolvedValue({ isSuccess: false, error: new Error('fail') })

    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    await expect(
      controller.getBudgetsByClient('client-1', { page: 1, limit: 10 } as any),
    ).rejects.toThrow()
  })

  it('getBudgetWithItems returns value on success and throws on failure', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    const payload = { id: 'b-1', items: [] }
    getBudgetWithItemsUseCase.execute.mockResolvedValue({ isSuccess: true, value: payload })
    const res = await controller.getBudgetWithItems('c-1', 'b-1')
    expect(getBudgetWithItemsUseCase.execute).toHaveBeenCalledWith('b-1')
    expect(res).toEqual(payload)

    getBudgetWithItemsUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(controller.getBudgetWithItems('c-1', 'b-1')).rejects.toThrow()
  })

  it('getBudgetItems returns value on success and throws on failure', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    const payload = { data: [], meta: {} }
    getBudgetItemsUseCase.execute.mockResolvedValue({ isSuccess: true, value: payload })

    const res = await controller.getBudgetItems('c-1', 'b-1', { page: 1, limit: 5 } as any)
    expect(getBudgetItemsUseCase.execute).toHaveBeenCalledWith('b-1', 1, 5)
    expect(res).toEqual(payload)

    getBudgetItemsUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(
      controller.getBudgetItems('c-1', 'b-1', { page: 1, limit: 5 } as any),
    ).rejects.toThrow()
  })

  it('isBudgetExpired returns boolean when found and throws when use case fails', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    checkExpireUseCase.execute.mockResolvedValue({ isSuccess: true, value: true })
    const yes = await controller.isBudgetExpired('c-1', 'b-1')
    expect(yes).toEqual({ expired: true, budgetId: 'b-1' })

    checkExpireUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(controller.isBudgetExpired('c-1', 'b-1')).rejects.toThrow()
  })

  it('approveBudget returns budget on success and throws when approve or get fails', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    approveUseCase.execute.mockResolvedValue({ isSuccess: true })
    getBudgetWithItemsUseCase.execute.mockResolvedValue({ isSuccess: true, value: { id: 'b-1' } })

    const res = await controller.approveBudget('b-1')
    expect(approveUseCase.execute).toHaveBeenCalledWith('b-1')
    expect(getBudgetWithItemsUseCase.execute).toHaveBeenCalledWith('b-1')
    expect(res).toEqual({ id: 'b-1' })

    // approve fails
    approveUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(controller.approveBudget('b-1')).rejects.toThrow()

    // approve ok but get fails
    approveUseCase.execute.mockResolvedValue({ isSuccess: true })
    getBudgetWithItemsUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(controller.approveBudget('b-1')).rejects.toThrow()
  })

  it('approveBudget throws when approve use case rejects', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    const err = new Error('boom')
    approveUseCase.execute.mockRejectedValue(err)

    await expect(controller.approveBudget('b-1')).rejects.toBe(err)
  })

  it('rejectBudget returns budget on success and throws when reject or get fails', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    rejectUseCase.execute.mockResolvedValue({ isSuccess: true })
    getBudgetWithItemsUseCase.execute.mockResolvedValue({ isSuccess: true, value: { id: 'b-1' } })

    const res = await controller.rejectBudget('b-1', { reason: 'nope' })
    expect(rejectUseCase.execute).toHaveBeenCalledWith('b-1', 'nope')
    expect(res).toEqual({ id: 'b-1' })

    // reject fails
    rejectUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(controller.rejectBudget('b-1', { reason: 'nope' })).rejects.toThrow()

    // reject ok but get fails
    rejectUseCase.execute.mockResolvedValue({ isSuccess: true })
    getBudgetWithItemsUseCase.execute.mockResolvedValue({
      isSuccess: false,
      error: new Error('no'),
    })
    await expect(controller.rejectBudget('b-1', { reason: 'nope' })).rejects.toThrow()
  })

  it('rejectBudget throws when reject use case rejects', async () => {
    const controller = new ClientBudgetsController(
      getBudgetsUseCase,
      getBudgetWithItemsUseCase,
      approveUseCase,
      rejectUseCase,
      checkExpireUseCase,
      getBudgetItemsUseCase,
      presenter,
    )

    const err = new Error('boom')
    rejectUseCase.execute.mockRejectedValue(err)

    await expect(controller.rejectBudget('b-1', { reason: 'nope' })).rejects.toBe(err)
  })
})
