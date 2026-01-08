import { GetServiceOrdersByClientIdUseCase } from '@application/service-orders/use-cases'

describe('GetServiceOrdersByClientIdUseCase', () => {
  it('returns SUCCESS when repository resolves', async () => {
    const repo = {
      findByClientId: jest.fn().mockResolvedValue({
        data: [{ id: 'so1' }],
        meta: { page: 1, totalPages: 1, total: 1 },
      }),
    }
    const uc = new GetServiceOrdersByClientIdUseCase(repo as any)

    const res = await uc.execute('c1', 1, 10)
    expect(res.isSuccess).toBeTruthy()
  })

  it('returns FAILURE when repository throws', async () => {
    const repo = { findByClientId: jest.fn().mockRejectedValue(new Error('db')) }
    const uc = new GetServiceOrdersByClientIdUseCase(repo as any)

    const res = await uc.execute('c1', 1, 10)
    expect(res.isFailure).toBeTruthy()
  })
})
