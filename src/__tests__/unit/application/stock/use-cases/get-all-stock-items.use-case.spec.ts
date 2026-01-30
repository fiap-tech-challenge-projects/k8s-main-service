import { StockItemMapper } from '@application/stock/mappers'
import { GetAllStockItemsUseCase } from '@application/stock/use-cases'

describe('GetAllStockItemsUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetAllStockItemsUseCase

  beforeEach(() => {
    mockRepo = { findAll: jest.fn() }
    jest
      .spyOn(StockItemMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)
    useCase = new GetAllStockItemsUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with mapped data', async () => {
    mockRepo.findAll.mockResolvedValue({
      data: [{ id: 'st-1' }],
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
