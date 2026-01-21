import { BudgetMapper } from '@application/budget/mappers'
import { GetAllBudgetsUseCase } from '@application/budget/use-cases'

describe('GetAllBudgetsUseCase', () => {
  let mockRepo: any
  let mockUserCtx: any
  let useCase: GetAllBudgetsUseCase

  beforeEach(() => {
    mockRepo = { findAll: jest.fn() }
    mockUserCtx = { getUserId: jest.fn().mockReturnValue('u-1') }
    jest.spyOn(BudgetMapper, 'toResponseDtoArray').mockImplementation((arr: any[]) => arr as any)
    useCase = new GetAllBudgetsUseCase(mockRepo, mockUserCtx)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success with mapped budgets', async () => {
    mockRepo.findAll.mockResolvedValue({ data: [{ id: 'b1' }], meta: { total: 1 } })

    const res = await useCase.execute(1, 10)

    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value.data[0].id).toBe('b1')
  })

  it('returns Failure when repo throws DomainException', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('boom'))

    const res = await useCase.execute()

    expect(res.isFailure).toBeTruthy()
  })
})
