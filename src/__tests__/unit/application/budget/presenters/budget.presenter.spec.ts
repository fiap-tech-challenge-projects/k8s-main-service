import { BudgetResponseDto, PaginatedBudgetsResponseDto } from '@application/budget/dto'
import { BudgetPresenter } from '@application/budget/presenters'

describe('BudgetPresenter', () => {
  const presenter = new BudgetPresenter()

  it('present maps dates to ISO and optional fields when undefined', () => {
    const dto: BudgetResponseDto = {
      id: 'b1',
      status: 'SENT',
      totalAmount: '100,00',
      validityPeriod: 30,
      generationDate: new Date('2020-01-01T00:00:00Z'),
      sentDate: undefined,
      approvalDate: undefined,
      rejectionDate: undefined,
      deliveryMethod: undefined,
      notes: undefined,
      serviceOrderId: 'so1',
      clientId: 'c1',
      createdAt: new Date('2020-01-01T00:00:00Z'),
      updatedAt: new Date('2020-01-02T00:00:00Z'),
    }

    const out = presenter.present(dto)
    expect(out.generationDate).toBe('2020-01-01T00:00:00.000Z')
    expect(out.createdAt).toBe('2020-01-01T00:00:00.000Z')
    expect(out.sentDate).toBeUndefined()
  })

  it('presentPaginatedBudgets uses presentPaginated and preserves meta', () => {
    const dto: BudgetResponseDto = {
      id: 'b2',
      status: 'APPROVED',
      totalAmount: '200.00',
      validityPeriod: 10,
      generationDate: new Date('2022-02-02T00:00:00.000Z'),
      sentDate: new Date('2022-02-02T01:00:00.000Z'),
      approvalDate: new Date('2022-02-03T00:00:00.000Z'),
      rejectionDate: undefined,
      deliveryMethod: undefined,
      notes: 'note',
      serviceOrderId: 'so2',
      clientId: 'c2',
      createdAt: new Date('2022-02-02T02:00:00.000Z'),
      updatedAt: new Date('2022-02-02T03:00:00.000Z'),
    }

    const paginated: PaginatedBudgetsResponseDto = {
      data: [dto],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    }

    const out = presenter.presentPaginatedBudgets(paginated)
    expect(out.meta.page).toBe(1)
    expect(out.data[0].sentDate).toBe('2022-02-02T01:00:00.000Z')
    expect(out.data[0].approvalDate).toBe('2022-02-03T00:00:00.000Z')
  })
})
