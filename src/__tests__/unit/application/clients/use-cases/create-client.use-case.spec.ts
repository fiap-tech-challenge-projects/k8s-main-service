import { ClientMapper } from '@application/clients/mappers'
import { CreateClientUseCase } from '@application/clients/use-cases'
import { CpfCnpj } from '@domain/clients/value-objects'
import { Email } from '@shared/value-objects'

describe('CreateClientUseCase', () => {
  const repo: any = {
    findByEmail: jest.fn(),
    findByCpfCnpj: jest.fn(),
    create: jest.fn(),
  }
  const userContext: any = { getUserId: () => 'u-1' }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when email exists', async () => {
    jest.spyOn(Email, 'create').mockReturnValue({ value: 'a@b.com' } as any)
    repo.findByEmail.mockResolvedValue({ id: 'c-1' })

    const useCase = new CreateClientUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ email: 'a@b.com', cpfCnpj: '52998224725' } as any)

    expect(res.isFailure).toBe(true)
  })

  it('creates client successfully', async () => {
    jest.spyOn(Email, 'create').mockReturnValue({ value: 'a@b.com' } as any)
    jest.spyOn(CpfCnpj, 'create').mockReturnValue({ value: '52998224725' } as any)
    repo.findByEmail.mockResolvedValue(null)
    repo.findByCpfCnpj.mockResolvedValue(null)
    repo.create.mockResolvedValue({ id: 'c-1' })

    jest.spyOn(ClientMapper, 'fromCreateDto').mockReturnValue({} as any)
    jest.spyOn(ClientMapper, 'toResponseDto').mockReturnValue({ id: 'c-1' } as any)

    const useCase = new CreateClientUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ email: 'a@b.com', cpfCnpj: '52998224725' } as any)

    expect(res.isSuccess).toBe(true)
    expect((res as any).value.id).toBe('c-1')
    expect(repo.create).toHaveBeenCalled()
  })

  // DUPLICATE FROM: src/__tests__/unit/application/clients/create-client.use-case.spec.ts
})
