import { StockItemMapper } from '@application/stock/mappers'
import { UpdateStockItemUseCase } from '@application/stock/use-cases'

describe('UpdateStockItemUseCase', () => {
  it('returns SUCCESS when item exists and updated', async () => {
    const existing = { id: 'si-1', name: 'Old' }
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 'si-1', name: 'New' }),
    }

    jest
      .spyOn(StockItemMapper, 'fromUpdateDto')
      .mockImplementation((dto: any, ex: any) => ({ ...ex, ...dto }))
    jest.spyOn(StockItemMapper, 'toResponseDto').mockReturnValue({ id: 'si-1', name: 'New' } as any)

    const useCase = new UpdateStockItemUseCase(repo as any)
    const res = await useCase.execute('si-1', { name: 'New' } as any)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('si-1')
  })

  it('returns FAILURE when item not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new UpdateStockItemUseCase(repo as any)

    const res = await useCase.execute('missing', { name: 'x' } as any)
    expect(res.isFailure).toBe(true)
  })

  it('returns FAILURE when repo throws', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const useCase = new UpdateStockItemUseCase(repo as any)

    const res = await useCase.execute('si-1', { name: 'x' } as any)
    expect(res.isFailure).toBe(true)
  })
})
