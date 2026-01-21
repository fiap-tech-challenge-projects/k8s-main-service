import { CheckSkuAvailabilityUseCase } from '@application/stock/use-cases'

describe('CheckSkuAvailabilityUseCase', () => {
  it('returns SUCCESS(true) when sku not found', async () => {
    const repo: any = { findBySku: jest.fn().mockResolvedValue(null) }
    const uc = new CheckSkuAvailabilityUseCase(repo)
    const res = await uc.execute('sku-1')
    expect(res.isSuccess).toBe(true)
    expect(res.unwrap()).toBe(true)
    expect(repo.findBySku).toHaveBeenCalledWith('sku-1')
  })

  it('returns SUCCESS(false) when sku exists', async () => {
    const repo: any = { findBySku: jest.fn().mockResolvedValue({ id: 's1' }) }
    const uc = new CheckSkuAvailabilityUseCase(repo)
    const res = await uc.execute('sku-1')
    expect(res.isSuccess).toBe(true)
    expect(res.unwrap()).toBe(false)
  })

  it('returns FAILURE when repository throws', async () => {
    const repo: any = { findBySku: jest.fn().mockRejectedValue(new Error('boom')) }
    const uc = new CheckSkuAvailabilityUseCase(repo)
    const res = await uc.execute('sku-1')
    expect(res.isFailure).toBe(true)
  })
})
