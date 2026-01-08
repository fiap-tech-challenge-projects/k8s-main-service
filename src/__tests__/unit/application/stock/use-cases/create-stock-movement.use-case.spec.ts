/* eslint-disable import/no-internal-modules */
import { StockMovementMapper } from '@application/stock/mappers'
import { CreateStockMovementUseCase } from '@application/stock/use-cases'
import { StockMovement } from '@domain/stock/entities'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'

beforeEach(() => setupLoggerMock())
afterEach(() => clearLoggerMocks())

describe('CreateStockMovementUseCase', () => {
  it('returns Success when stock movement created', async () => {
    const dto = { stockId: 's-1', quantity: 1 }
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 's-1', sku: 'sku-1' }),
      createStockMovement: jest.fn().mockResolvedValue({ id: 'm-1' }),
    }
    jest
      .spyOn(StockMovementMapper, 'toResponseDto')
      .mockReturnValue({ id: 'm-1', stockId: 's-1', quantity: 1 } as any)
    jest.spyOn(StockMovement, 'create').mockReturnValue({} as any)

    const useCase = new CreateStockMovementUseCase(repo as any)

    const res = await useCase.execute(dto as any)
    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('m-1')
  })

  it('returns Failure when item not found', async () => {
    const dto = { stockId: 'x', quantity: 1 }
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
    }
    const useCase = new CreateStockMovementUseCase(repo as any)

    const res = await useCase.execute(dto as any)
    expect(res.isFailure).toBe(true)
  })
})
