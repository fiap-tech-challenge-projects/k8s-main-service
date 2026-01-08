import { DeleteServiceUseCase } from '@application/services/use-cases'
import { ServiceNotFoundException } from '@domain/services/exceptions'

describe('DeleteServiceUseCase', () => {
  const userContext: any = { getUserId: jest.fn().mockReturnValue('u-1') }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when service not found', async () => {
    const repo: any = { findById: jest.fn().mockResolvedValue(null) }
    const uc = new DeleteServiceUseCase(repo as any, userContext as any)

    const res = await uc.execute('svc-1')
    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect(res.error).toBeInstanceOf(ServiceNotFoundException)
  })

  it('returns Success when service exists and delete succeeds', async () => {
    const repo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'svc-1' }),
      delete: jest.fn().mockResolvedValue(undefined),
    }

    const uc = new DeleteServiceUseCase(repo as any, userContext as any)
    const res = await uc.execute('svc-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toBe(true)
  })

  it('returns Failure when repository.delete rejects', async () => {
    const repo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'svc-1' }),
      delete: jest.fn().mockRejectedValue(new Error('db')),
    }

    const uc = new DeleteServiceUseCase(repo as any, userContext as any)
    const res = await uc.execute('svc-1')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect(res.error.message).toBe('db')
  })
})
