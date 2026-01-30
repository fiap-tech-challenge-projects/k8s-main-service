import { ClientMapper } from '@application/clients/mappers'
/* eslint-disable import/no-internal-modules */
import { GetClientByIdUseCase } from '@application/clients/use-cases/get-client-by-id.use-case'
import { ClientNotFoundException } from '@domain/clients/exceptions'
import { Success, Failure } from '@shared/types'

describe('GetClientByIdUseCase', () => {
  const mockClientRepo: any = { findById: jest.fn() }
  const mockUserContext: any = { getUserId: jest.fn().mockReturnValue('u1') }

  const sut = new GetClientByIdUseCase(mockClientRepo, mockUserContext)

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when client not found', async () => {
    mockClientRepo.findById.mockResolvedValue(null)

    const result = await sut.execute('c1')

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(ClientNotFoundException)
  })

  it('returns Success with mapped dto when client exists', async () => {
    const client: any = { id: 'c1', name: 'Client' }
    mockClientRepo.findById.mockResolvedValue(client)
    jest.spyOn(ClientMapper, 'toResponseDto').mockReturnValue({ id: 'c1' } as any)

    const result = await sut.execute('c1')

    expect(result).toBeInstanceOf(Success)
    expect((result as any).value.id).toBe('c1')
  })
})
