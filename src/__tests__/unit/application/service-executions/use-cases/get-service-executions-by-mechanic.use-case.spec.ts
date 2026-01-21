import { GetServiceExecutionsByMechanicUseCase } from '@application/service-executions/use-cases'

describe('GetServiceExecutionsByMechanicUseCase', () => {
  it('maps repository items to response DTOs and returns Success', async () => {
    const makeEntity = (id: string) => ({
      id,
      getDurationInMinutes: () => 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const repo: any = { findByMechanicId: async () => [makeEntity('se1'), makeEntity('se2')] }
    const uc = new GetServiceExecutionsByMechanicUseCase(repo)
    const res = await uc.execute('mech-1')
    expect(res.isSuccess).toBe(true)
    const arr = res.unwrap()
    expect(Array.isArray(arr)).toBe(true)
    expect(arr.length).toBe(2)
  })

  it('returns Failure when repository throws', async () => {
    const repo: any = {
      findByMechanicId: async () => {
        throw new Error('boom')
      },
    }
    const uc = new GetServiceExecutionsByMechanicUseCase(repo)
    const res = await uc.execute('mech-1')
    expect(res.isFailure).toBe(true)
  })
})
