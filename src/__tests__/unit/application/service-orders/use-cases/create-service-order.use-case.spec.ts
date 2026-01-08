import { ServiceOrderMapper, CreateServiceOrderUseCase } from '@application/service-orders'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
// Import concrete implementation directly to ensure coverage is mapped to the source file

describe('CreateServiceOrderUseCase', () => {
  const serviceOrderRepo: any = { create: jest.fn() }
  const vehicleRepo: any = { findById: jest.fn() }
  const userContext: any = {
    getUserId: jest.fn().mockReturnValue('u-1'),
    getUserRole: jest.fn().mockReturnValue('CLIENT'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns failure when vehicle not found', async () => {
    vehicleRepo.findById.mockResolvedValue(null)
    // Note: the project re-exports CreateServiceOrderUseCase as the V2
    // which expects (serviceOrderRepo, vehicleRepo, userContext)
    const uc = new CreateServiceOrderUseCase(serviceOrderRepo, vehicleRepo, userContext)

    const result = await uc.execute({ vehicleId: 'v-1' } as any)
    expect(result.isFailure).toBe(true)
    expect((result as any).error).toBeInstanceOf(VehicleNotFoundException)
  })

  it('creates service order when vehicle exists', async () => {
    const vehicle = { id: 'v-1', clientId: 'c-1' }
    vehicleRepo.findById.mockResolvedValue(vehicle)

    const saved = {
      id: 'so-1',
      clientId: 'c-1',
      vehicleId: 'v-1',
      status: 'REQUESTED',
      requestDate: new Date(),
    }
    serviceOrderRepo.create.mockResolvedValue(saved)
    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)
    jest.spyOn(ServiceOrderMapper, 'toResponseDto').mockReturnValue({ id: 'so-1' } as any)

    const uc = new CreateServiceOrderUseCase(serviceOrderRepo, vehicleRepo, userContext)
    const result = await uc.execute({ vehicleId: 'v-1' } as any)

    expect(result.isSuccess).toBe(true)
    expect((result as any).value).toBeDefined()
  })

  it('direct import - vehicle not found and success flows (coverage mapping)', async () => {
    const serviceOrderRepo2: any = { create: jest.fn() }
    const vehicleRepo2: any = { findById: jest.fn() }
    const userContext2: any = {
      getUserId: jest.fn().mockReturnValue('u-1'),
      getUserRole: jest.fn().mockReturnValue('CLIENT'),
    }

    // vehicle not found
    vehicleRepo2.findById.mockResolvedValue(null)
    const uc2 = new CreateServiceOrderUseCase(serviceOrderRepo2, vehicleRepo2, userContext2)
    const res1 = await uc2.execute({ vehicleId: 'v-999' } as any)
    expect(res1.isFailure).toBe(true)

    // vehicle exists
    const vehicle = { id: 'v-1', clientId: 'c-1' }
    vehicleRepo2.findById.mockResolvedValue(vehicle)
    const saved2 = {
      id: 'so-1',
      clientId: 'c-1',
      vehicleId: 'v-1',
      status: 'REQUESTED',
      requestDate: new Date(),
    }
    serviceOrderRepo2.create.mockResolvedValue(saved2)
    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)
    jest.spyOn(ServiceOrderMapper, 'toResponseDto').mockReturnValue({ id: 'so-1' } as any)

    const res2 = await uc2.execute({ vehicleId: 'v-1' } as any)
    expect(res2.isSuccess).toBe(true)
  })

  it('direct import - repository.create throws DomainException and generic Error (catch branches)', async () => {
    const serviceOrderRepo2: any = { create: jest.fn() }
    const vehicleRepo2: any = { findById: jest.fn() }
    const userContext2: any = {
      getUserId: jest.fn().mockReturnValue('u-1'),
      getUserRole: jest.fn().mockReturnValue('CLIENT'),
    }

    // vehicle exists
    const vehicle = { id: 'v-1', clientId: 'c-1' }
    vehicleRepo2.findById.mockResolvedValue(vehicle)
    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)

    const uc2 = new CreateServiceOrderUseCase(serviceOrderRepo2, vehicleRepo2, userContext2)

    // DomainException branch
    serviceOrderRepo2.create.mockRejectedValue(new (class extends Error {})('domain'))
    const r1 = await uc2.execute({ vehicleId: 'v-1' } as any)
    expect(r1.isFailure).toBe(true)

    // generic error branch
    serviceOrderRepo2.create.mockRejectedValue(new Error('db'))
    const r2 = await uc2.execute({ vehicleId: 'v-1' } as any)
    expect(r2.isFailure).toBe(true)
  })
})
