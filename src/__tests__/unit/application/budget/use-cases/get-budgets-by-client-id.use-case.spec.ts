import { BudgetMapper } from '@application/budget/mappers'
import { GetBudgetsByClientIdUseCase } from '@application/budget/use-cases'

describe('GetBudgetsByClientIdUseCase', () => {
  let mockRepo: any
  let mockUserCtx: any
  let useCase: GetBudgetsByClientIdUseCase

  beforeEach(() => {
    mockRepo = { findByClientId: jest.fn() }
    mockUserCtx = { getUserId: jest.fn().mockReturnValue('u-1') }
    jest
      .spyOn(BudgetMapper, 'toResponseDtoArray')
      .mockImplementation((arr: any[]) => arr.map((a) => ({ id: a.id })) as any)
    useCase = new GetBudgetsByClientIdUseCase(mockRepo, mockUserCtx)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when repository returns budgets', async () => {
    mockRepo.findByClientId.mockResolvedValue({
      data: [{ id: 'b-1' }],
      meta: { page: 1, total: 1, totalPages: 1 },
    })

    const res = await useCase.execute('client-1', 1, 10)

    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value.data).toEqual([{ id: 'b-1' }])
  })

  it('returns Failure when repository throws', async () => {
    mockRepo.findByClientId.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('client-1')

    expect(res.isFailure).toBeTruthy()
  })
})
