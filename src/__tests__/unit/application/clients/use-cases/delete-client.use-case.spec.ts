import { DeleteClientUseCase } from '@application/clients/use-cases'

describe('DeleteClientUseCase', () => {
  it('returns Success when client exists and deleted', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'c-1' }),
      delete: jest.fn().mockResolvedValue(true),
    }
    const user = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteClientUseCase(repo as any, user as any)

    const res = await useCase.execute('c-1')
    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when client not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const user = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteClientUseCase(repo as any, user as any)

    const res = await useCase.execute('c-1')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repo.delete throws', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'c-1' }),
      delete: jest.fn().mockRejectedValue(new Error('db')),
    }
    const user = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteClientUseCase(repo as any, user as any)

    const res = await useCase.execute('c-1')
    expect(res.isFailure).toBe(true)
  })
})
