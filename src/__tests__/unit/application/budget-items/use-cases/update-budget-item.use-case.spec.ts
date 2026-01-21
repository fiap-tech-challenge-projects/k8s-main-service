/* eslint-disable import/no-internal-modules */
import { UpdateBudgetItemUseCase } from '@application/budget-items/use-cases/update-budget-item.use-case'
import { BudgetItemNotFoundException } from '@domain/budget-items/exceptions'
import { Success, Failure } from '@shared/types'

describe('UpdateBudgetItemUseCase', () => {
  const mockBudgetItemRepo: any = { findById: jest.fn(), update: jest.fn() }
  const mockBudgetRepo: any = { findByIdWithItems: jest.fn(), update: jest.fn() }
  const mockUserContext: any = { getUserId: jest.fn().mockReturnValue('u1') }

  const sut = new UpdateBudgetItemUseCase(mockBudgetItemRepo, mockBudgetRepo, mockUserContext)

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when budget item not found', async () => {
    mockBudgetItemRepo.findById.mockResolvedValue(null)

    const result = await sut.execute('bi1', { description: 'x' } as any)

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(BudgetItemNotFoundException)
  })

  it('updates item and recalculates budget when budgetWithItems exists', async () => {
    const existing: any = {
      id: 'bi1',
      budgetId: 'b1',
      description: 'old',
      updateDescription: jest.fn(),
      getFormattedUnitPrice: jest.fn().mockReturnValue('R$100,00'),
      getFormattedTotalPrice: jest.fn().mockReturnValue('R$100,00'),
    }
    const saved: any = {
      id: 'bi1',
      budgetId: 'b1',
      getFormattedUnitPrice: jest.fn().mockReturnValue('R$100,00'),
      getFormattedTotalPrice: jest.fn().mockReturnValue('R$100,00'),
    }

    mockBudgetItemRepo.findById.mockResolvedValue(existing)
    mockBudgetItemRepo.update.mockResolvedValue(saved)
    mockBudgetRepo.findByIdWithItems.mockResolvedValue({
      budget: {
        recalculateTotalAmount: jest.fn().mockReturnValue({ totalAmount: { value: 300 } }),
      },
      budgetItems: [],
    })

    const result = await sut.execute('bi1', { description: 'new' } as any)

    expect(result).toBeInstanceOf(Success)
    expect(mockBudgetItemRepo.update).toHaveBeenCalledWith('bi1', existing)
    expect(mockBudgetRepo.update).toHaveBeenCalled()
  })

  it('updates item and proceeds when budgetWithItems is missing', async () => {
    const existing: any = {
      id: 'bi2',
      budgetId: 'b2',
      description: 'old',
      updateDescription: jest.fn(),
      getFormattedUnitPrice: jest.fn().mockReturnValue('R$100,00'),
      getFormattedTotalPrice: jest.fn().mockReturnValue('R$100,00'),
    }
    const saved: any = {
      id: 'bi2',
      budgetId: 'b2',
      getFormattedUnitPrice: jest.fn().mockReturnValue('R$100,00'),
      getFormattedTotalPrice: jest.fn().mockReturnValue('R$100,00'),
    }

    mockBudgetItemRepo.findById.mockResolvedValue(existing)
    mockBudgetItemRepo.update.mockResolvedValue(saved)
    mockBudgetRepo.findByIdWithItems.mockResolvedValue(null)

    const result = await sut.execute('bi2', { description: 'new' } as any)

    expect(result).toBeInstanceOf(Success)
    expect(mockBudgetItemRepo.update).toHaveBeenCalled()
    expect(mockBudgetRepo.update).not.toHaveBeenCalled()
  })

  it('handles unexpected errors and returns Failure', async () => {
    mockBudgetItemRepo.findById.mockRejectedValue(new Error('boom'))

    const result = await sut.execute('err', { description: 'x' } as any)

    expect(result).toBeInstanceOf(Failure)
  })
})
