import { StockItemMapper } from '@application/stock/mappers'
import { GetStockItemsByNameUseCase } from '@application/stock/use-cases'

describe('GetStockItemsByNameUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetStockItemsByNameUseCase

  beforeEach(() => {
    mockRepo = { findByName: jest.fn() }
    jest
      .spyOn(StockItemMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)
    useCase = new GetStockItemsByNameUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with mapped data', async () => {
    mockRepo.findByName.mockResolvedValue({
      data: [{ id: 'st-1' }],
      meta: { total: 1, totalPages: 1, page: 1 },
    })
    const result = await useCase.execute('Part', 1, 10)
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value.data).toHaveLength(1)
  })

  it('returns Failure on repo error', async () => {
    mockRepo.findByName.mockRejectedValue(new Error('db'))
    const result = await useCase.execute('X')
    expect(result.isFailure).toBeTruthy()
  })
})
