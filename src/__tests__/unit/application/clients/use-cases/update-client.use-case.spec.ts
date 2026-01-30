import { ClientMapper } from '@application/clients/mappers'
import { UpdateClientUseCase } from '@application/clients/use-cases'

describe('UpdateClientUseCase', () => {
  const repo: any = { findById: jest.fn(), emailExists: jest.fn(), update: jest.fn() }
  const userContext: any = { getUserId: () => 'u-1' }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when client not found', async () => {
    repo.findById.mockResolvedValue(null)

    const useCase = new UpdateClientUseCase(repo as any, userContext as any)
    const res = await useCase.execute('c-1', { email: 'a@b.com' } as any)

    expect(res.isFailure).toBe(true)
  })

  it('fails when email already exists', async () => {
    repo.findById.mockResolvedValue({ id: 'c-1' })
    repo.emailExists.mockResolvedValue(true)

    const useCase = new UpdateClientUseCase(repo as any, userContext as any)
    const res = await useCase.execute('c-1', { email: 'a@b.com' } as any)

    expect(res.isFailure).toBe(true)
  })

  it('updates successfully', async () => {
    const existing = { id: 'c-1', email: 'a@b.com' }
    repo.findById.mockResolvedValue(existing)
    repo.update.mockResolvedValue(existing)

    // ensure email uniqueness check returns false for success path
    repo.emailExists.mockResolvedValue(false)

    jest.spyOn(ClientMapper, 'fromUpdateDto').mockReturnValue({} as any)
    jest.spyOn(ClientMapper, 'toResponseDto').mockReturnValue({ id: 'c-1' } as any)

    const useCase = new UpdateClientUseCase(repo as any, userContext as any)
    const res = await useCase.execute('c-1', { email: 'a@b.com' } as any)

    expect(res.isSuccess).toBe(true)
    expect((res as any).value.id).toBe('c-1')
  })
})
