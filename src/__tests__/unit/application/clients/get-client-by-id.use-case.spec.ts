import { ClientMapper } from '@application/clients/mappers'
import { GetClientByIdUseCase } from '@application/clients/use-cases'
import { IClientRepository } from '@domain/clients/interfaces'

describe('GetClientByIdUseCase - Unit Tests', () => {
  let useCase: GetClientByIdUseCase
  let mockClientRepository: jest.Mocked<IClientRepository>
  let mockUserContextService: any

  beforeEach(() => {
    jest.restoreAllMocks()
    mockClientRepository = { findById: jest.fn() } as any
    mockUserContextService = { getUserId: jest.fn().mockReturnValue(null) }

    useCase = new GetClientByIdUseCase(mockClientRepository as any, mockUserContextService as any)
  })

  it('returns Failure when client not found', async () => {
    mockClientRepository.findById.mockResolvedValue(null)
    const result = await useCase.execute('missing-id')
    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Success with mapped dto when client exists', async () => {
    const client = { id: 'c2', name: 'Beta Co', email: 'b@c.com' } as any
    mockClientRepository.findById.mockResolvedValue(client)

    const mapperSpy = jest
      .spyOn(ClientMapper, 'toResponseDto')
      .mockReturnValue({ id: 'c2', name: 'Beta Co', email: 'b@c.com' } as any)

    const result = await useCase.execute('c2')
    expect((result as any).isSuccess).toBeTruthy()
    const dto = (result as any).value
    expect(dto.id).toBe('c2')
    expect(mapperSpy).toHaveBeenCalled()

    mapperSpy.mockRestore()
  })
})
