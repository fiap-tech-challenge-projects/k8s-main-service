import { Logger } from '@nestjs/common'

import { ServiceMapper } from '@application/services/mappers'
import { CreateServiceUseCase } from '@application/services/use-cases'
import { ServiceNameAlreadyExistsException } from '@domain/services/exceptions'
import {
  ServiceNameValidator,
  ServiceDescriptionValidator,
  PriceValidator,
} from '@domain/services/validators'

describe('CreateServiceUseCase', () => {
  const repo: any = { findByName: jest.fn(), create: jest.fn() }
  const userContext: any = { getUserId: () => 'u-1' }

  beforeEach(() => jest.clearAllMocks())
  afterEach(() => jest.restoreAllMocks())

  it('returns Failure when service name already exists', async () => {
    repo.findByName.mockResolvedValue({ data: [{ id: 's-1' }] })

    const useCase = new CreateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ name: 'Exists', description: 'd', price: 50 } as any)

    expect(res.isFailure).toBe(true)
  })

  it('returns Success when service is created', async () => {
    repo.findByName.mockResolvedValue({ data: [] })
    repo.create.mockResolvedValue({ id: 's-1', name: 'Oil change' })

    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)
    jest.spyOn(ServiceMapper, 'fromCreateDto').mockReturnValue({} as any)
    jest.spyOn(ServiceMapper, 'toResponseDto').mockReturnValue({ id: 's-1' } as any)

    const useCase = new CreateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute({
      name: 'Oil change',
      description: 'desc',
      price: 100,
    } as any)

    expect(res.isSuccess).toBe(true)
    expect((res as any).value.id).toBe('s-1')
    expect(repo.create).toHaveBeenCalled()
  })

  it('returns Failure when price is invalid and logs error', async () => {
    repo.findByName.mockResolvedValue({ data: [] })

    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(false)

    jest.spyOn(Logger.prototype, 'error').mockImplementation()

    const useCase = new CreateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ name: 'Oil', description: 'd', price: 'bad' } as any)

    expect((res as any).isFailure).toBeTruthy()
    expect(Logger.prototype.error).toHaveBeenCalled()
  })

  it('preserves DomainException thrown by repository.create and logs error', async () => {
    repo.findByName.mockResolvedValue({ data: [] })
    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)
    jest.spyOn(ServiceMapper, 'fromCreateDto').mockReturnValue({} as any)

    const domainErr = new ServiceNameAlreadyExistsException('Oil')
    repo.create.mockRejectedValue(domainErr)

    jest.spyOn(Logger.prototype, 'error').mockImplementation()

    const useCase = new CreateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ name: 'Oil', description: 'd', price: 100 } as any)

    expect((res as any).isFailure).toBeTruthy()
    expect((res as any).error).toBe(domainErr)
    expect(Logger.prototype.error).toHaveBeenCalled()
  })

  it('converts unexpected repo errors to fallback DomainException and logs error', async () => {
    repo.findByName.mockRejectedValue(new Error('db failure'))

    // ensure validators pass so we reach the repository error branch
    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)
    jest.spyOn(ServiceMapper, 'fromCreateDto').mockReturnValue({} as any)

    jest.spyOn(Logger.prototype, 'error').mockImplementation()

    const useCase = new CreateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ name: 'Oil', description: 'd', price: 100 } as any)

    expect((res as any).isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(ServiceNameAlreadyExistsException)
    expect(Logger.prototype.error).toHaveBeenCalled()
  })

  // Additional checks merged from duplicate spec
  it('returns Failure when service name already exists (merged)', async () => {
    repo.findByName.mockResolvedValue({ data: [{ id: 's1' }] })

    const useCase = new CreateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute({ name: 'S', description: 'd', price: 10 } as any)

    expect((res as any).isFailure).toBeTruthy()
  })

  it('returns Success when creation valid (merged)', async () => {
    repo.findByName.mockResolvedValue({ data: [] })
    jest.spyOn(ServiceMapper, 'fromCreateDto').mockReturnValue({ name: 'S' } as any)
    // ensure validators accept the values
    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => undefined)
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)
    const saved = { id: 's2', name: 'S' } as any
    repo.create.mockResolvedValue(saved)
    jest.spyOn(ServiceMapper, 'toResponseDto').mockReturnValue(saved as any)

    const res = await new CreateServiceUseCase(repo as any, userContext as any).execute({
      name: 'S',
      description: 'd',
      price: 10,
    } as any)

    expect((res as any).isSuccess).toBeTruthy()
    expect(repo.create).toHaveBeenCalled()
  })
})
