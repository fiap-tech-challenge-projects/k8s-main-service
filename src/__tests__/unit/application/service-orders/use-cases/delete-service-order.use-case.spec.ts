import { DeleteServiceOrderUseCase } from '@application/service-orders/use-cases'

describe('DeleteServiceOrderUseCase', () => {
  it('returns SUCCESS(true) when service order exists and deleted', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'so-1' }),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    const userContext = { getUserId: jest.fn().mockReturnValue('u-1') }

    const useCase = new DeleteServiceOrderUseCase(repo as any, userContext as any)
    const res = await useCase.execute('so-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toBe(true)
  })

  it('returns FAILURE when service order not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const userContext = { getUserId: jest.fn().mockReturnValue('u-1') }

    const useCase = new DeleteServiceOrderUseCase(repo as any, userContext as any)
    const res = await useCase.execute('missing')
    expect(res.isFailure).toBe(true)
  })

  it('returns FAILURE when repo throws', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const userContext = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteServiceOrderUseCase(repo as any, userContext as any)

    const res = await useCase.execute('so-1')
    expect(res.isFailure).toBe(true)
  })
})
