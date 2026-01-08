import { CheckStockAvailabilityUseCase } from '@application/stock/use-cases'

describe('CheckStockAvailabilityUseCase (unit)', () => {
  let mockRepo: any
  let useCase: CheckStockAvailabilityUseCase

  beforeEach(() => {
    mockRepo = { findById: jest.fn() }
    useCase = new CheckStockAvailabilityUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success(true) when stock available', async () => {
    mockRepo.findById.mockResolvedValue({ id: 's1', currentStock: 5 })

    const result = await useCase.execute('s1', 3)

    expect(mockRepo.findById).toHaveBeenCalledWith('s1')
    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value).toBe(true)
  })

  it('returns Success(false) when stock item not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing', 1)

    expect(mockRepo.findById).toHaveBeenCalledWith('missing')
    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value).toBe(false)
  })

  it('returns Failure when repository throws', async () => {
    const err = new Error('db down')
    mockRepo.findById.mockRejectedValue(err)

    const result = await useCase.execute('s1', 1)

    expect(result.isFailure).toBeTruthy()
    if (result.isFailure) expect(result.error).toBe(err)
  })
})
