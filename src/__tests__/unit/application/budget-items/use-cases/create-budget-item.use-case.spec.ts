/* eslint-disable import/no-internal-modules */
import { CreateBudgetItemUseCase } from '@application/budget-items/use-cases/create-budget-item.use-case'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import { Success, Failure } from '@shared/types'

describe('CreateBudgetItemUseCase', () => {
  const mockBudgetItemRepo: any = { create: jest.fn() }
  const mockBudgetRepo: any = {
    findById: jest.fn(),
    findByIdWithItems: jest.fn(),
    update: jest.fn(),
  }
  const mockServiceOrderRepo: any = { findById: jest.fn() }
  const mockUserContext: any = { getUserId: jest.fn().mockReturnValue('u1') }

  const sut = new CreateBudgetItemUseCase(
    mockBudgetItemRepo,
    mockBudgetRepo,
    mockServiceOrderRepo,
    mockUserContext,
  )

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when budget not found', async () => {
    mockBudgetRepo.findById.mockResolvedValue(null)

    const result = await sut.execute({
      budgetId: 'b1',
      type: 'SERVICE',
      description: 'd',
      quantity: 1,
      unitPrice: '100',
    } as any)

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(BudgetNotFoundException)
  })

  it('returns Failure when service order not found', async () => {
    const budget: any = { id: 'b1', serviceOrderId: 'so1' }
    mockBudgetRepo.findById.mockResolvedValue(budget)
    mockServiceOrderRepo.findById.mockResolvedValue(null)

    const result = await sut.execute({
      budgetId: 'b1',
      type: 'SERVICE',
      description: 'd',
      quantity: 1,
      unitPrice: '100',
    } as any)

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(ServiceOrderNotFoundException)
  })

  it('creates a budget item and recalculates budget when budgetWithItems exists', async () => {
    const budget: any = { id: 'b1', serviceOrderId: 'so1' }
    const serviceOrder: any = { id: 'so1', status: 'IN_DIAGNOSIS' }
    const createdItem: any = {
      id: 'bi1',
      type: 'SERVICE',
      description: 'd',
      quantity: 1,
      getFormattedUnitPrice: jest.fn().mockReturnValue('R$100,00'),
      getFormattedTotalPrice: jest.fn().mockReturnValue('R$100,00'),
      budgetId: 'b1',
      notes: null,
      stockItemId: null,
      serviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockBudgetRepo.findById.mockResolvedValue(budget)
    mockServiceOrderRepo.findById.mockResolvedValue(serviceOrder)
    mockBudgetItemRepo.create.mockResolvedValue(createdItem)
    mockBudgetRepo.findByIdWithItems.mockResolvedValue({
      budget: {
        recalculateTotalAmount: jest.fn().mockReturnValue({ totalAmount: { value: 200 } }),
      },
      budgetItems: [],
    })

    const result = await sut.execute({
      budgetId: 'b1',
      type: 'SERVICE',
      description: 'd',
      quantity: 1,
      unitPrice: '100',
    } as any)

    expect(result).toBeInstanceOf(Success)
    expect(mockBudgetItemRepo.create).toHaveBeenCalled()
    expect(mockBudgetRepo.update).toHaveBeenCalled()
  })

  it('handles unexpected errors and returns Failure', async () => {
    mockBudgetRepo.findById.mockRejectedValue(new Error('boom'))

    const result = await sut.execute({
      budgetId: 'err',
      type: 'SERVICE',
      description: 'd',
      quantity: 1,
      unitPrice: '100',
    } as any)

    expect(result).toBeInstanceOf(Failure)
  })
})
