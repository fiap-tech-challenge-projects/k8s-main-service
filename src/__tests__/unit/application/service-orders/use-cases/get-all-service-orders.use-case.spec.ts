import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { GetAllServiceOrdersUseCase } from '@application/service-orders/use-cases'

describe('GetAllServiceOrdersUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetAllServiceOrdersUseCase

  beforeEach(() => {
    mockRepo = { findAll: jest.fn() }
    jest
      .spyOn(ServiceOrderMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)
    useCase = new GetAllServiceOrdersUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with mapped data', async () => {
    mockRepo.findAll.mockResolvedValue({
      data: [{ id: 'so-1' }],
      meta: { total: 1, totalPages: 1, page: 1 },
    })
    const result = await useCase.execute(1, 10)
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value.data).toHaveLength(1)
  })

  it('returns Failure on repo error', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('db'))
    const result = await useCase.execute()
    expect(result.isFailure).toBeTruthy()
  })
})
