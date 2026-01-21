import { GetBudgetItemsUseCase } from '@application/budget'
import { BudgetItemMapper } from '@application/budget-items/mappers'

describe('GetBudgetItemsUseCase', () => {
  const mockRepo = { findByBudgetId: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new GetBudgetItemsUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns mapped items on success', async () => {
    const items = [{ id: 'bi-1' }]
    mockRepo.findByBudgetId.mockResolvedValue(items)
    jest.spyOn(BudgetItemMapper, 'toResponseDto').mockReturnValue({ id: 'bi-1' } as any)

    const res = await useCase.execute('budget-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toHaveLength(1)
  })

  it('returns failure when repository throws', async () => {
    mockRepo.findByBudgetId.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('budget-err')

    expect(res.isFailure).toBe(true)
  })
})
