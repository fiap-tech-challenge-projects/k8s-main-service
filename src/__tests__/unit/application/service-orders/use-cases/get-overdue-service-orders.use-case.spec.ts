import { GetOverdueServiceOrdersUseCase } from '@application/service-orders/use-cases'

describe('GetOverdueServiceOrdersUseCase', () => {
  it('returns SUCCESS when repository resolves', async () => {
    const repo = {
      findOverdue: jest.fn().mockResolvedValue({
        data: [{ id: 'so1' }],
        meta: { page: 1, totalPages: 1, total: 1 },
      }),
    }
    const uc = new GetOverdueServiceOrdersUseCase(repo as any)

    const res = await uc.execute(1, 10)
    expect(res.isSuccess).toBeTruthy()
  })

  it('returns FAILURE when repository throws', async () => {
    const repo = { findOverdue: jest.fn().mockRejectedValue(new Error('db')) }
    const uc = new GetOverdueServiceOrdersUseCase(repo as any)

    const res = await uc.execute(1, 10)
    expect(res.isFailure).toBeTruthy()
  })
})
