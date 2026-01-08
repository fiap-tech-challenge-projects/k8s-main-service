import { ServiceOrderStatus, BudgetItemType } from '@prisma/client'

import { CreateBudgetItemUseCase } from '@application/budget-items/use-cases'
import { Budget } from '@domain/budget/entities'
import { Price } from '@shared/value-objects'

describe('CreateBudgetItemUseCase (recalculate branch)', () => {
  it('creates budget item and recalculates budget when budgetWithItems is found', async () => {
    const budget = Budget.create('so-1', 'c-1', 30)
    const budgetWithItems = {
      budget,
      budgetItems: [{ totalPrice: Price.create('100.00') }, { totalPrice: Price.create('50.00') }],
    }

    const mockBudgetRepo: any = {
      findById: jest.fn().mockResolvedValue(budget),
      findByIdWithItems: jest.fn().mockResolvedValue(budgetWithItems),
      update: jest.fn().mockResolvedValue(true),
    }

    const mockBudgetItemRepo: any = {
      create: jest.fn().mockImplementation((b: any) => {
        // ensure we return the same BudgetItem instance so mapper methods exist
        // set id for the saved entity (runtime assignment is fine for tests)
        b.id = 'bi-1'
        return Promise.resolve(b)
      }),
    }
    const mockServiceOrderRepo: any = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSIS }),
    }
    const mockUserCtx: any = { getUserId: jest.fn().mockReturnValue('u1') }

    const uc = new CreateBudgetItemUseCase(
      mockBudgetItemRepo,
      mockBudgetRepo,
      mockServiceOrderRepo,
      mockUserCtx,
    )

    const dto: any = {
      budgetId: 'b1',
      type: BudgetItemType.SERVICE,
      unitPrice: '100.00',
      quantity: 1,
      description: 'part',
    }

    const result = await uc.execute(dto)

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) {
      expect(result.value.id).toBe('bi-1')
    }

    expect(mockBudgetRepo.update).toHaveBeenCalled()
  })
})
