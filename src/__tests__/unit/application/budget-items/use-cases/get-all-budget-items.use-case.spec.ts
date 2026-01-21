import { GetAllBudgetItemsUseCase } from '@application/budget-items/use-cases'

describe('GetAllBudgetItemsUseCase', () => {
  it('returns Success when repository returns paginated data', async () => {
    const paginated = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    const mockRepo = { findAll: jest.fn().mockResolvedValue(paginated) }
    const mockUserCtx = { getUserId: jest.fn().mockReturnValue('u1') }

    const uc = new GetAllBudgetItemsUseCase(mockRepo as any, mockUserCtx as any)

    const result = await uc.execute(1, 10)

    expect(result.isSuccess).toBeTruthy()
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { findAll: jest.fn().mockRejectedValue(new Error('db')) }
    const mockUserCtx = { getUserId: jest.fn().mockReturnValue('u1') }

    const uc = new GetAllBudgetItemsUseCase(mockRepo as any, mockUserCtx as any)

    const result = await uc.execute(1, 10)

    expect(result.isFailure).toBeTruthy()
  })
})
