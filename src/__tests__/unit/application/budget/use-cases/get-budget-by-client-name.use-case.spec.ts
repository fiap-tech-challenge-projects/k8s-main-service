import { BudgetMapper } from '@application/budget/mappers'
import { GetBudgetByClientNameUseCase } from '@application/budget/use-cases'

describe('GetBudgetByClientNameUseCase', () => {
  let mockRepo: any
  let mockUserCtx: any
  let useCase: GetBudgetByClientNameUseCase

  beforeEach(() => {
    mockRepo = { findByClientName: jest.fn() }
    mockUserCtx = { getUserId: jest.fn().mockReturnValue('u-1') }
    jest.spyOn(BudgetMapper, 'toResponseDtoArray').mockImplementation((arr: any[]) => arr as any)
    useCase = new GetBudgetByClientNameUseCase(mockRepo, mockUserCtx)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when repo returns results', async () => {
    mockRepo.findByClientName.mockResolvedValue({ data: [{ id: 'b2' }], meta: { total: 1 } })

    const res = await useCase.execute('ACME')

    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value.data[0].id).toBe('b2')
  })

  it('returns Failure on repo error', async () => {
    mockRepo.findByClientName.mockRejectedValue(new Error('fail'))

    const res = await useCase.execute('X')

    expect(res.isFailure).toBeTruthy()
  })
})
