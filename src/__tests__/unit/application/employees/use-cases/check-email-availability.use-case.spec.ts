import { CheckEmailAvailabilityUseCase } from '@application/employees/use-cases'

describe('CheckEmailAvailabilityUseCase', () => {
  it('returns available when repo returns false', async () => {
    const repo = { emailExists: jest.fn().mockResolvedValue(false) }
    const userCtx = { getUserId: jest.fn().mockReturnValue('u1') }
    const uc = new CheckEmailAvailabilityUseCase(repo as any, userCtx as any)

    const res = await uc.execute('a@b.c')
    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.unwrap()).toEqual({ available: true })
  })

  it('returns failure when repo throws', async () => {
    const repo = { emailExists: jest.fn().mockRejectedValue(new Error('db')) }
    const userCtx = { getUserId: jest.fn().mockReturnValue('u1') }
    const uc = new CheckEmailAvailabilityUseCase(repo as any, userCtx as any)

    const res = await uc.execute('a@b.c')
    expect(res.isFailure).toBeTruthy()
  })
})
