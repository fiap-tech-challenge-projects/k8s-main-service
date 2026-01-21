import { StockItemMapper } from '@application/stock/mappers'
import { GetStockItemsBySupplierUseCase } from '@application/stock/use-cases'

describe('GetStockItemsBySupplierUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetStockItemsBySupplierUseCase

  beforeEach(() => {
    mockRepo = { findBySupplier: jest.fn() }
    jest
      .spyOn(StockItemMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)
    useCase = new GetStockItemsBySupplierUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with mapped data', async () => {
    mockRepo.findBySupplier.mockResolvedValue({
      data: [{ id: 'st-2' }],
      meta: { total: 1, totalPages: 1, page: 1 },
    })
    const result = await useCase.execute('ACME', 1, 5)
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value.data).toHaveLength(1)
  })

  it('returns Failure on repo error', async () => {
    mockRepo.findBySupplier.mockRejectedValue(new Error('db'))
    const result = await useCase.execute('ACME')
    expect(result.isFailure).toBeTruthy()
  })
})
