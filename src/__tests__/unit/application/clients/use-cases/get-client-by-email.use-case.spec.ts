import { ClientMapper } from '@application/clients/mappers'
/* eslint-disable import/no-internal-modules */
import { GetClientByEmailUseCase } from '@application/clients/use-cases/get-client-by-email.use-case'
import { ClientNotFoundException } from '@domain/clients/exceptions'
import { Success, Failure } from '@shared/types'

describe('GetClientByEmailUseCase', () => {
  const mockClientRepo: any = { findByEmail: jest.fn() }
  const mockUserContext: any = { getUserId: jest.fn().mockReturnValue('u1') }

  const sut = new GetClientByEmailUseCase(mockClientRepo, mockUserContext)

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when client not found', async () => {
    mockClientRepo.findByEmail.mockResolvedValue(null)

    const result = await sut.execute('noone@example.com')

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(ClientNotFoundException)
  })

  it('returns Success with mapped dto when client exists', async () => {
    const client: any = { id: 'c2', name: 'Client2', email: 'c2@example.com' }
    mockClientRepo.findByEmail.mockResolvedValue(client)
    jest
      .spyOn(ClientMapper, 'toResponseDto')
      .mockReturnValue({ id: 'c2', email: 'c2@example.com' } as any)

    const result = await sut.execute('c2@example.com')

    expect(result).toBeInstanceOf(Success)
    expect((result as any).value.email).toBe('c2@example.com')
  })
})
