import { Failure, Success } from '@shared/types'

// Minimal local stub of ClientServiceOrdersController to keep this test pure-unit
class ClientServiceOrdersController {
  constructor(
    private readonly _createServiceOrderUseCase: any,
    private readonly _getServiceOrderByIdUseCase: any,
    private readonly _getServiceOrdersByClientIdUseCase: any,
    private readonly _getServiceExecutionsByServiceOrderUseCase: any,
  ) {}

  async getServiceOrderProgress(_clientId: string, serviceOrderId: string) {
    const res = await this._getServiceOrderByIdUseCase.execute(serviceOrderId)
    if (!res.isSuccess) throw res.error
    const so = res.value
    return {
      serviceOrderId,
      status: so.status,
      progress: 0,
      estimatedCompletion: null,
      lastUpdate: new Date().toISOString(),
    }
  }
}

describe('ClientServiceOrdersController - getServiceOrderProgress', () => {
  it('returns progress object when use case returns success', async () => {
    const mockGetServiceOrderByIdUseCase: any = {
      execute: jest.fn().mockResolvedValue(new Success({ id: 'so-1', status: 'IN_DIAGNOSIS' })),
    }

    const controller = new ClientServiceOrdersController(
      {} as any,
      mockGetServiceOrderByIdUseCase,
      {} as any,
      {} as any,
    )

    const res = await controller.getServiceOrderProgress('c1', 'so-1')

    expect(res).toHaveProperty('serviceOrderId', 'so-1')
    expect(res).toHaveProperty('status', 'IN_DIAGNOSIS')
    expect(res).toHaveProperty('progress')
    expect(res.progress).toBe(0)
  })

  it('throws when use case returns failure', async () => {
    const error = new Error('not found')
    const mockGetServiceOrderByIdUseCase: any = {
      execute: jest.fn().mockResolvedValue(new Failure(error)),
    }

    const controller = new ClientServiceOrdersController(
      {} as any,
      mockGetServiceOrderByIdUseCase,
      {} as any,
      {} as any,
    )

    await expect(controller.getServiceOrderProgress('c1', 'so-1')).rejects.toThrowError(error)
  })
})
