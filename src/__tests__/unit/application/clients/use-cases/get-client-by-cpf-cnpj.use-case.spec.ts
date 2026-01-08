import { GetClientByCpfCnpjUseCase } from '@application/clients'
import { ClientMapper } from '@application/clients/mappers'
import { CpfCnpj } from '@domain/clients/value-objects'

describe('GetClientByCpfCnpjUseCase', () => {
  const mockRepo = { findByCpfCnpj: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new GetClientByCpfCnpjUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns mapped client when found', async () => {
    const dto = { id: 'c-1' }
    const cpf = '12345678901'
    jest.spyOn(CpfCnpj, 'create').mockReturnValue({ value: cpf } as any)
    mockRepo.findByCpfCnpj.mockResolvedValue({ id: 'c-1' })
    jest.spyOn(ClientMapper, 'toResponseDto').mockReturnValue(dto as any)

    const res = await useCase.execute(cpf)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toEqual(dto)
  })

  it('returns failure when repository throws', async () => {
    jest.spyOn(CpfCnpj, 'create').mockReturnValue({ value: 'x' } as any)
    mockRepo.findByCpfCnpj.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('x')

    expect(res.isFailure).toBe(true)
  })
})
