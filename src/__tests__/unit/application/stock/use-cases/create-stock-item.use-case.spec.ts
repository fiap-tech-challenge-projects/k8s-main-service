import { StockItemMapper } from '@application/stock/mappers'
import { CreateStockItemUseCase } from '@application/stock/use-cases'

describe('CreateStockItemUseCase', () => {
  afterEach(() => jest.restoreAllMocks())

  it('returns success when creating new item', async () => {
    const dto = { name: 'Bolt', sku: 'B-1', currentStock: 10 }
    const repo: any = {
      findBySku: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 's1', ...dto }),
    }

    jest
      .spyOn(StockItemMapper, 'fromCreateDto')
      .mockReturnValue({ name: 'Bolt', sku: 'B-1', currentStock: 10 } as any)
    jest.spyOn(StockItemMapper, 'toResponseDto').mockReturnValue({ id: 's1', ...dto } as any)

    const uc = new CreateStockItemUseCase(repo)
    const res = await uc.execute(dto as any)

    expect(repo.findBySku).toHaveBeenCalledWith('B-1')
    expect(repo.create).toHaveBeenCalled()
    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value).toHaveProperty('id', 's1')
  })

  it('returns failure when sku already exists', async () => {
    const dto = { name: 'Bolt', sku: 'B-1', currentStock: 10 }
    const repo: any = { findBySku: jest.fn().mockResolvedValue({ id: 's1' }) }

    const uc = new CreateStockItemUseCase(repo)
    const res = await uc.execute(dto as any)

    expect(res.isFailure).toBeTruthy()
  })

  it('returns failure when repository throws on create', async () => {
    const dto = { name: 'Bolt', sku: 'B-1', currentStock: 10 }
    const repo: any = {
      findBySku: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockRejectedValue(new Error('boom')),
    }

    jest
      .spyOn(StockItemMapper, 'fromCreateDto')
      .mockReturnValue({ name: 'Bolt', sku: 'B-1', currentStock: 10 } as any)

    const uc = new CreateStockItemUseCase(repo)
    const res = await uc.execute(dto as any)

    expect(res.isFailure).toBeTruthy()
  })
})
