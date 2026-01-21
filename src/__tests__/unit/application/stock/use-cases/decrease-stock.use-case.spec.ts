import { DecreaseStockUseCase } from '@application/stock/use-cases'
import { StockMovement } from '@domain/stock/entities'
import { EntityNotFoundException } from '@shared/exceptions'

describe('DecreaseStockUseCase (unit)', () => {
  let mockStockRepo: any
  let useCase: DecreaseStockUseCase

  beforeEach(() => {
    mockStockRepo = { findById: jest.fn(), createStockMovement: jest.fn() }
    useCase = new DecreaseStockUseCase(mockStockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Failure when stock item not found', async () => {
    mockStockRepo.findById.mockResolvedValue(null)

    const res = await useCase.execute('s1', 1, 'r')

    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(EntityNotFoundException)
  })

  it('returns Success when movement created', async () => {
    const stockItem = { id: 's1' }
    const movement = { id: 'm1', stockItemId: 's1' }
    mockStockRepo.findById.mockResolvedValue(stockItem)
    mockStockRepo.createStockMovement.mockResolvedValue(movement)

    const res = await useCase.execute('s1', 2, 'reason')

    expect(res.isSuccess).toBeTruthy()
    expect((res as any).value).toHaveProperty('id')
    expect(mockStockRepo.createStockMovement).toHaveBeenCalled()
  })

  it('returns Failure when repository.createStockMovement throws', async () => {
    const stockItem = { id: 's1' }
    mockStockRepo.findById.mockResolvedValue(stockItem)
    mockStockRepo.createStockMovement.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('s1', 2, 'reason')

    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(Error)
  })

  it('returns Failure when StockMovement.create throws', async () => {
    const stockItem = { id: 's1' }
    mockStockRepo.findById.mockResolvedValue(stockItem)

    const spy = jest.spyOn(StockMovement, 'create').mockImplementation(() => {
      throw new Error('invalid movement')
    })

    const res = await useCase.execute('s1', 2, 'reason')

    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(Error)

    spy.mockRestore()
  })
})
