import { CheckCpfCnpjAvailabilityUseCase } from '@application/clients/use-cases'

describe('CheckCpfCnpjAvailabilityUseCase', () => {
  it('returns available when repository reports false', async () => {
    const repo = { cpfCnpjExists: jest.fn().mockResolvedValue(false) }
    const userCtx = { getUserId: jest.fn().mockReturnValue('u1') }
    const uc = new CheckCpfCnpjAvailabilityUseCase(repo as any, userCtx as any)

    const res = await uc.execute('123')
    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.unwrap()).toBe(true)
  })

  it('returns failure when repository throws', async () => {
    const repo = { cpfCnpjExists: jest.fn().mockRejectedValue(new Error('db')) }
    const userCtx = { getUserId: jest.fn().mockReturnValue('u1') }
    const uc = new CheckCpfCnpjAvailabilityUseCase(repo as any, userCtx as any)

    const res = await uc.execute('123')
    expect(res.isFailure).toBeTruthy()
  })
})
