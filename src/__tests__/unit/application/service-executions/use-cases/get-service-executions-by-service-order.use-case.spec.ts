import { GetServiceExecutionsByServiceOrderUseCase } from '@application/service-executions/use-cases'

describe('GetServiceExecutionsByServiceOrderUseCase', () => {
  it('wraps paginated repository result into Success', async () => {
    const makeEntity = (id: string) => ({
      id,
      getDurationInMinutes: () => 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const repo: any = {
      findByServiceOrderIdPaginated: async () => ({
        data: [makeEntity('se1')],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      }),
    }

    const uc = new GetServiceExecutionsByServiceOrderUseCase(repo)
    const res = await uc.execute('so-1', 1, 10)
    expect(res.isSuccess).toBe(true)
    const pag = res.unwrap()
    expect(pag.data).toHaveLength(1)
    expect(pag.meta.total).toBe(1)
  })

  it('returns Failure when repository throws', async () => {
    const repo: any = {
      findByServiceOrderIdPaginated: async () => {
        throw new Error('boom')
      },
    }
    const uc = new GetServiceExecutionsByServiceOrderUseCase(repo)
    const res = await uc.execute('so-1')
    expect(res.isFailure).toBe(true)
  })
})
