import { GetBudgetItemsByBudgetIdPaginatedUseCase } from '@application/budget-items'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'

describe('GetBudgetItemsByBudgetIdPaginatedUseCase', () => {
  const mockBudgetItemRepo: any = {
    findByBudgetIdPaginated: jest.fn(),
  }

  const mockBudgetRepo: any = {
    findById: jest.fn(),
  }

  const mockUserContext: any = {
    getUserId: jest.fn().mockReturnValue('user-1'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when budget not found', async () => {
    mockBudgetRepo.findById.mockResolvedValue(null)

    const sut = new GetBudgetItemsByBudgetIdPaginatedUseCase(
      mockBudgetItemRepo,
      mockBudgetRepo,
      mockUserContext,
    )

    const result = await sut.execute('budget-1', 1, 10)

    expect(result.isFailure).toBe(true)
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(BudgetNotFoundException)
    }
  })

  it('returns Success when repository returns paginated items', async () => {
    const paginated = {
      data: [{ id: 'item-1' }, { id: 'item-2' }],
      meta: { total: 2, page: 1, limit: 10 },
    }

    mockBudgetRepo.findById.mockResolvedValue({ id: 'budget-1' })
    mockBudgetItemRepo.findByBudgetIdPaginated.mockResolvedValue(paginated)
    jest.spyOn(BudgetItemMapper, 'toResponseDtoArray').mockReturnValue(paginated.data as any)

    const sut = new GetBudgetItemsByBudgetIdPaginatedUseCase(
      mockBudgetItemRepo,
      mockBudgetRepo,
      mockUserContext,
    )

    const result = await sut.execute('budget-1', 1, 10)

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.data).toHaveLength(2)
      expect(result.value.meta).toEqual(paginated.meta)
    }
  })

  it('returns Failure when repository throws', async () => {
    mockBudgetRepo.findById.mockResolvedValue({ id: 'budget-1' })
    mockBudgetItemRepo.findByBudgetIdPaginated.mockRejectedValue(new Error('db error'))

    const sut = new GetBudgetItemsByBudgetIdPaginatedUseCase(
      mockBudgetItemRepo,
      mockBudgetRepo,
      mockUserContext,
    )

    const result = await sut.execute('budget-1', 1, 10)

    expect(result.isFailure).toBe(true)
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(Error)
    }
  })
})
