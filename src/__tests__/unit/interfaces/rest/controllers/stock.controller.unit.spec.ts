import { StockController } from '@interfaces/rest/controllers'

describe('StockController (unit)', () => {
  let controller: StockController
  let mockDecrease: any
  let mockGetById: any

  beforeEach(() => {
    mockDecrease = { execute: jest.fn() }
    mockGetById = { execute: jest.fn() }

    controller = new StockController(
      {} as any,
      {} as any,
      mockGetById,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockDecrease,
      {} as any,
      {} as any,
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('decreaseStock returns updated stock when decrease succeeds', async () => {
    const stockItem = { id: 's1', currentStock: 10 }
    mockDecrease.execute.mockResolvedValue({ isSuccess: true })
    mockGetById.execute.mockResolvedValue({ isSuccess: true, value: stockItem })

    const out = await controller.decreaseStock('s1', { quantity: 1, reason: 'r' } as any)

    expect(mockDecrease.execute).toHaveBeenCalledWith('s1', 1, 'r')
    expect(out).toEqual(stockItem)
  })

  it('checkSkuAvailability returns exists true when sku taken', async () => {
    // attach mock to controller instance to avoid constructor mismatch
    ;(controller as any).checkSkuAvailabilityUseCase = {
      execute: jest.fn().mockResolvedValue({ isSuccess: true, value: false }),
    }

    const out = await controller.checkSkuAvailability('SKU1')

    expect((controller as any).checkSkuAvailabilityUseCase.execute).toHaveBeenCalledWith('SKU1')
    expect(out.exists).toBe(true)
    expect(out.sku).toBe('SKU1')
  })
})
