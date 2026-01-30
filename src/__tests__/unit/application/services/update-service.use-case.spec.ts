import { ServiceMapper } from '@application/services/mappers'
import { UpdateServiceUseCase } from '@application/services/use-cases'
import { IServiceRepository } from '@domain/services/interfaces'
import {
  ServiceNameValidator,
  ServiceDescriptionValidator,
  PriceValidator,
} from '@domain/services/validators'

describe('UpdateServiceUseCase - Unit Tests', () => {
  let useCase: UpdateServiceUseCase
  let mockServiceRepository: jest.Mocked<IServiceRepository>
  let mockUserContextService: any

  beforeEach(() => {
    jest.restoreAllMocks()
    mockServiceRepository = { findById: jest.fn(), update: jest.fn() } as any
    mockUserContextService = { getUserId: jest.fn().mockReturnValue(null) }

    useCase = new UpdateServiceUseCase(mockServiceRepository as any, mockUserContextService as any)
  })

  it('returns Failure when service not found', async () => {
    mockServiceRepository.findById.mockResolvedValue(null)
    const result = await useCase.execute('missing', { name: 'N' } as any)
    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Failure when validation throws', async () => {
    const existing = { id: 's2', name: 'Old', price: 10 } as any
    mockServiceRepository.findById.mockResolvedValue(existing)

    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(false)

    const result = await useCase.execute('s2', { price: 999 } as any)
    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Failure when repo.update throws', async () => {
    const existing = { id: 's3', name: 'Old', price: 10 } as any
    mockServiceRepository.findById.mockResolvedValue(existing)
    mockServiceRepository.update.mockRejectedValue(new Error('db'))

    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)

    const result = await useCase.execute('s3', { name: 'New' } as any)
    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Success on valid update', async () => {
    const existing = { id: 's4', name: 'Old', price: 10 } as any
    mockServiceRepository.findById.mockResolvedValue(existing)
    const updated = { ...existing, name: 'New' } as any
    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)

    jest.spyOn(ServiceMapper, 'fromUpdateDto').mockReturnValue(updated as any)
    mockServiceRepository.update.mockResolvedValue(updated as any)
    jest.spyOn(ServiceMapper, 'toResponseDto').mockReturnValue(updated as any)

    const result = await useCase.execute('s4', { name: 'New' } as any)
    expect((result as any).isSuccess).toBeTruthy()
    expect(mockServiceRepository.update).toHaveBeenCalled()
  })
})
