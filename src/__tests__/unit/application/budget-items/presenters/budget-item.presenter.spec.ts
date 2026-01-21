import {
  BudgetItemResponseDto,
  PaginatedBudgetItemsResponseDto,
} from '@application/budget-items/dto'
import { BudgetItemPresenter } from '@application/budget-items/presenters'

describe('BudgetItemPresenter', () => {
  it('formats a BudgetItemResponseDto with updatedAt fallback to createdAt', () => {
    const presenter = new BudgetItemPresenter()

    const created = new Date('2021-05-10T10:00:00.000Z')

    const dto: BudgetItemResponseDto = {
      id: 'item_1',
      type: 'service',
      description: 'Test service',
      quantity: 2,
      unitPrice: 'R$50,00',
      totalPrice: 'R$100,00',
      budgetId: 'budget_1',
      notes: 'none',
      stockItemId: undefined,
      serviceId: undefined,
      createdAt: created,
      // updatedAt intentionally undefined to exercise fallback
    }

    const result = presenter.present(dto)

    expect(result).toEqual({
      id: 'item_1',
      type: 'service',
      description: 'Test service',
      quantity: 2,
      unitPrice: 'R$50,00',
      totalPrice: 'R$100,00',
      budgetId: 'budget_1',
      notes: 'none',
      stockItemId: undefined,
      serviceId: undefined,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    })
  })

  it('formats paginated result by delegating to BasePresenter.presentPaginated', () => {
    const presenter = new BudgetItemPresenter()

    const now = new Date('2022-01-01T12:00:00.000Z')

    const item: BudgetItemResponseDto = {
      id: 'item_2',
      type: 'part',
      description: 'Part',
      quantity: 1,
      unitPrice: 'R$20,00',
      totalPrice: 'R$20,00',
      budgetId: 'budget_2',
      createdAt: now,
      updatedAt: now,
    }

    const paginated: PaginatedBudgetItemsResponseDto = {
      data: [item],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    }

    const res = presenter.presentPaginatedBudgetItems(paginated)

    expect(res.data).toHaveLength(1)
    expect(res.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
    expect(res.data[0].id).toBe('item_2')
    expect(res.data[0].createdAt).toBe(now.toISOString())
  })
})
