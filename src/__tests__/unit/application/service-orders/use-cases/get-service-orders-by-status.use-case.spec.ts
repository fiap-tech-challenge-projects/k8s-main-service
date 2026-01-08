import { ServiceOrderStatus } from '@prisma/client'

import { GetServiceOrdersByStatusUseCase } from '@application/service-orders/use-cases'

describe('GetServiceOrdersByStatusUseCase', () => {
  it('returns SUCCESS when repository resolves', async () => {
    const repo = {
      findByStatus: jest.fn().mockResolvedValue({
        data: [{ id: 'so1' }],
        meta: { page: 1, totalPages: 1, total: 1 },
      }),
    }
    const uc = new GetServiceOrdersByStatusUseCase(repo as any)

    const res = await uc.execute(ServiceOrderStatus.REQUESTED, 1, 10)
    expect(res.isSuccess).toBeTruthy()
  })

  it('returns FAILURE when repository throws', async () => {
    const repo = { findByStatus: jest.fn().mockRejectedValue(new Error('db')) }
    const uc = new GetServiceOrdersByStatusUseCase(repo as any)

    const res = await uc.execute(ServiceOrderStatus.CANCELLED, 1, 10)
    expect(res.isFailure).toBeTruthy()
  })
})
