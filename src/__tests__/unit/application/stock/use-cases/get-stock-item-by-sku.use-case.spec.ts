import { Logger } from '@nestjs/common'

import { StockItemMapper } from '@application/stock'
import { GetStockItemBySkuUseCase } from '@application/stock/use-cases'
import { EntityNotFoundException } from '@shared/exceptions'

describe('GetStockItemBySkuUseCase', () => {
  beforeAll(() => {
    // silence logger output during unit tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {})
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {})
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns success when stock item found by sku', async () => {
    const mockItem = { id: 'st-1', sku: 'SKU1', name: 'Wheel' }
    const mockRepo = { findBySku: jest.fn().mockResolvedValue(mockItem) }

    jest
      .spyOn(StockItemMapper, 'toResponseDto')
      .mockReturnValue({ id: 'st-1', sku: 'SKU1', name: 'Wheel' } as any)

    const useCase = new GetStockItemBySkuUseCase(mockRepo as any)
    const res = await useCase.execute('SKU1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.sku).toBe('SKU1')
  })

  it('returns failure when not found by sku (EntityNotFoundException)', async () => {
    const mockRepo = { findBySku: jest.fn().mockResolvedValue(null) }
    const useCase = new GetStockItemBySkuUseCase(mockRepo as any)

    const res = await useCase.execute('SKU1')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) {
      expect(res.error).toBeInstanceOf(EntityNotFoundException)
      expect(res.error.message).toMatch(/SKU: SKU1|SKU'/)
    }
  })

  it('returns failure when repository throws an Error instance', async () => {
    const mockRepo = { findBySku: jest.fn().mockRejectedValue(new Error('boom')) }
    const useCase = new GetStockItemBySkuUseCase(mockRepo as any)

    const res = await useCase.execute('SKU1')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) {
      expect(res.error).toBeInstanceOf(Error)
      expect(res.error.message).toBe('boom')
    }
  })

  it('converts non-Error rejection into generic Error', async () => {
    // simulate a repo that rejects with a non-Error (e.g., string)
    const mockRepo = { findBySku: jest.fn().mockRejectedValue('boom') }
    const useCase = new GetStockItemBySkuUseCase(mockRepo as any)

    const res = await useCase.execute('SKU1')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) {
      // implementation converts non-Error to new Error('Unknown error')
      expect(res.error).toBeInstanceOf(Error)
      expect(res.error.message).toBe('Unknown error')
    }
  })
})
