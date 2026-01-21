import { StockItemMapper } from '@application/stock/mappers'
import { GetStockItemByIdUseCase } from '@application/stock/use-cases'

describe('GetStockItemByIdUseCase', () => {
  const mockRepo = { findById: jest.fn() }
  const useCase = new GetStockItemByIdUseCase(mockRepo as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns success when stock item found', async () => {
    const dto = { id: 's1', name: 'part' }
    mockRepo.findById.mockResolvedValue({ id: 's1', name: 'part' })
    jest.spyOn(StockItemMapper, 'toResponseDto').mockReturnValue(dto as any)

    const res = await useCase.execute('s1')

    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value).toHaveProperty('id', 's1')
  })

  it('returns failure when stock item not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const res = await useCase.execute('s-not')
    expect(res.isSuccess).toBeFalsy()
  })

  it('returns failure when repository throws', async () => {
    mockRepo.findById.mockRejectedValue(new Error('db error'))

    const res = await useCase.execute('s-err')
    expect(res.isFailure).toBeTruthy()
  })
})
