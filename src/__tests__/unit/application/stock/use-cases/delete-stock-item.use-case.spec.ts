import { DeleteStockItemUseCase } from '@application/stock'

describe('DeleteStockItemUseCase', () => {
  const mockStockRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  }

  const useCase = new DeleteStockItemUseCase(mockStockRepository as any)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when item exists and is deleted', async () => {
    mockStockRepository.findById.mockResolvedValue({ id: 'stock-1' })
    mockStockRepository.delete.mockResolvedValue(undefined)

    const res = await useCase.execute('stock-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toBe(true)
    expect(mockStockRepository.findById).toHaveBeenCalledWith('stock-1')
    expect(mockStockRepository.delete).toHaveBeenCalledWith('stock-1')
  })

  it('returns failure when item not found', async () => {
    mockStockRepository.findById.mockResolvedValue(null)

    const res = await useCase.execute('missing')

    expect(res.isFailure).toBe(true)
    expect(mockStockRepository.delete).not.toHaveBeenCalled()
  })

  it('returns failure when repository throws', async () => {
    mockStockRepository.findById.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('err')

    expect(res.isFailure).toBe(true)
  })
})
