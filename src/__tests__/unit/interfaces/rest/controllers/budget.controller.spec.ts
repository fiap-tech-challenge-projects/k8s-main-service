import { Logger } from '@nestjs/common'

import { BudgetController } from '@interfaces/rest/controllers'

describe('BudgetController (pure unit)', () => {
  let controller: BudgetController

  const createBudgetUseCase = { execute: jest.fn() }
  const getBudgetByIdUseCase = { execute: jest.fn() }
  const approveBudgetUseCase = { execute: jest.fn() }
  const rejectBudgetUseCase = { execute: jest.fn() }
  const getAllBudgetsUseCase = { execute: jest.fn() }
  const getBudgetByClientNameUseCase = { execute: jest.fn() }
  const getBudgetByIdWithItemsUseCase = { execute: jest.fn() }
  const sendBudgetUseCase = { execute: jest.fn() }
  const markBudgetAsReceivedUseCase = { execute: jest.fn() }
  const checkBudgetExpirationUseCase = { execute: jest.fn() }
  const updateBudgetUseCase = { execute: jest.fn() }
  const deleteBudgetUseCase = { execute: jest.fn() }
  const budgetPresenter = { present: jest.fn() }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    Object.values({
      createBudgetUseCase,
      getBudgetByIdUseCase,
      approveBudgetUseCase,
      rejectBudgetUseCase,
      getAllBudgetsUseCase,
      getBudgetByClientNameUseCase,
      getBudgetByIdWithItemsUseCase,
      sendBudgetUseCase,
      markBudgetAsReceivedUseCase,
      checkBudgetExpirationUseCase,
      updateBudgetUseCase,
      deleteBudgetUseCase,
    }).forEach((m: any) => m.execute && m.execute.mockReset && m.execute.mockReset())

    controller = new BudgetController(
      createBudgetUseCase as any,
      getBudgetByIdUseCase as any,
      approveBudgetUseCase as any,
      rejectBudgetUseCase as any,
      getAllBudgetsUseCase as any,
      getBudgetByClientNameUseCase as any,
      getBudgetByIdWithItemsUseCase as any,
      sendBudgetUseCase as any,
      markBudgetAsReceivedUseCase as any,
      checkBudgetExpirationUseCase as any,
      updateBudgetUseCase as any,
      deleteBudgetUseCase as any,
      budgetPresenter as any,
    )
  })

  afterAll(() => jest.restoreAllMocks())

  it('create returns presented dto on success', async () => {
    const dto = { totalAmount: 100 }
    const domain = { id: 'b-1' }
    createBudgetUseCase.execute.mockResolvedValue({ isSuccess: true, value: domain })
    budgetPresenter.present.mockReturnValue({ id: 'b-1' })

    const res = await controller.create(dto as any)

    expect(createBudgetUseCase.execute).toHaveBeenCalledWith(dto)
    expect(budgetPresenter.present).toHaveBeenCalledWith(domain)
    expect(res).toEqual({ id: 'b-1' })
  })

  it('getById returns presented dto when found', async () => {
    const id = 'b-1'
    const domain = { id }
    getBudgetByIdUseCase.execute.mockResolvedValue({ isSuccess: true, value: domain })
    budgetPresenter.present.mockReturnValue({ id })

    const res = await controller.getById(id)

    expect(getBudgetByIdUseCase.execute).toHaveBeenCalledWith(id)
    expect(res).toEqual({ id })
  })

  it('getById throws when not found', async () => {
    getBudgetByIdUseCase.execute.mockResolvedValue({ isSuccess: false, error: new Error('nf') })

    await expect(controller.getById('x')).rejects.toThrow()
  })

  it('approve returns presented dto on success', async () => {
    const id = 'b-2'
    approveBudgetUseCase.execute.mockResolvedValue({ isSuccess: true, value: { id } })
    budgetPresenter.present.mockReturnValue({ id })

    const res = await controller.approve(id)

    expect(approveBudgetUseCase.execute).toHaveBeenCalledWith(id)
    expect(res).toEqual({ id })
  })

  it('approve throws when use-case fails', async () => {
    approveBudgetUseCase.execute.mockResolvedValue({ isSuccess: false, error: new Error('bad') })

    await expect(controller.approve('x')).rejects.toThrow()
  })

  it('send returns presented dto on success', async () => {
    sendBudgetUseCase.execute.mockResolvedValue({ isSuccess: true, value: { id: 's-1' } })
    budgetPresenter.present.mockReturnValue({ id: 's-1' })

    const res = await controller.send('s-1')

    expect(sendBudgetUseCase.execute).toHaveBeenCalledWith('s-1')
    expect(res).toEqual({ id: 's-1' })
  })

  it('isExpired returns boolean from checkBudgetExpirationUseCase', async () => {
    checkBudgetExpirationUseCase.execute.mockResolvedValue({ isSuccess: true, value: true })

    const res = await controller.isExpired('b-1')

    expect(checkBudgetExpirationUseCase.execute).toHaveBeenCalledWith('b-1')
    expect(res).toEqual({ expired: true })
  })

  it('markAsReceived logs and throws when use-case throws', async () => {
    markBudgetAsReceivedUseCase.execute.mockRejectedValue(new Error('boom'))

    await expect(controller.markAsReceived('b-1')).rejects.toThrow()
  })

  it('delete calls delete use-case and does not throw on success', async () => {
    deleteBudgetUseCase.execute.mockResolvedValue({ isSuccess: true })

    await expect(controller.delete('b-1')).resolves.toBeUndefined()
  })
})
