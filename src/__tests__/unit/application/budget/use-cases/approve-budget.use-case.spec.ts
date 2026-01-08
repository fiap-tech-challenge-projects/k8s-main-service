import { BudgetItemType } from '@prisma/client'

import { BudgetMapper } from '@application/budget/mappers'
import { ApproveBudgetUseCase } from '@application/budget/use-cases'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { Success } from '@shared/types'

describe('ApproveBudgetUseCase (unit)', () => {
  let mockRepo: any
  let mockCheckStock: any
  let mockEventEmitter: any
  let mockUserContext: any
  let useCase: ApproveBudgetUseCase

  const budgetDomain: any = {
    id: 'budget-1',
    status: 'SENT',
    isExpired: () => false,
    getExpirationDate: () => null,
    approve: jest.fn(),
  }

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), update: jest.fn(), findByIdWithItems: jest.fn() }
    mockCheckStock = { execute: jest.fn() }
    mockEventEmitter = { emitBudgetApprovedEvent: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }

    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation((b: any) => ({ id: b.id }) as any)
    jest
      .spyOn(BudgetItemMapper, 'toResponseDtoArray')
      .mockImplementation((items: any[]) => items as any)

    useCase = new ApproveBudgetUseCase(mockRepo, mockCheckStock, mockEventEmitter, mockUserContext)
  })

  afterEach(() => jest.clearAllMocks())

  it('approves budget when stock available', async () => {
    mockRepo.findById.mockResolvedValue(budgetDomain)
    mockRepo.update.mockResolvedValue({ ...budgetDomain, status: 'APPROVED' })
    mockRepo.findByIdWithItems.mockResolvedValue({
      budgetItems: [{ type: BudgetItemType.STOCK_ITEM, stockItemId: 's1', quantity: 1 }],
    })
    mockCheckStock.execute.mockResolvedValue(new Success(true))

    const result = await useCase.execute('budget-1')

    expect(mockRepo.findById).toHaveBeenCalledWith('budget-1')
    expect(mockCheckStock.execute).toHaveBeenCalled()
    expect(mockRepo.update).toHaveBeenCalled()
    expect(mockEventEmitter.emitBudgetApprovedEvent).toHaveBeenCalled()
    expect(result.isSuccess).toBeTruthy()
  })

  it('returns Failure when stock is insufficient', async () => {
    mockRepo.findById.mockResolvedValue(budgetDomain)
    mockRepo.findByIdWithItems.mockResolvedValue({
      budgetItems: [{ type: BudgetItemType.STOCK_ITEM, stockItemId: 's1', quantity: 5 }],
    })
    mockCheckStock.execute.mockResolvedValue(new Success(false))

    const result = await useCase.execute('budget-1')

    expect(result.isFailure).toBeTruthy()
    expect(mockEventEmitter.emitBudgetApprovedEvent).not.toHaveBeenCalled()
  })

  it('returns Failure when budget not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing')

    expect(result.isFailure).toBeTruthy()
  })
})
