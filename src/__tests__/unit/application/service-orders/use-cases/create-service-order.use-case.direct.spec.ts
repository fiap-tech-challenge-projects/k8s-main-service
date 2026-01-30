// This spec intentionally imports the concrete implementation directly
// for coverage mapping of the original CreateServiceOrderUseCase. The
// deep import is allowed only here.
/* eslint-disable import/no-internal-modules */
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { CreateServiceOrderUseCase } from '@application/service-orders/use-cases/create-service-order.use-case'
/* eslint-enable import/no-internal-modules */

describe('CreateServiceOrderUseCase - direct import (coverage mapping)', () => {
  let serviceOrderRepo: any
  let vehicleRepo: any
  let userContext: any

  beforeEach(() => {
    serviceOrderRepo = { create: jest.fn() }
    vehicleRepo = { findById: jest.fn() }
    userContext = {
      getUserId: jest.fn().mockReturnValue('u-1'),
      getUserRole: jest.fn().mockReturnValue('EMPLOYEE'),
    }
    jest.clearAllMocks()
  })

  it('returns Failure when vehicle not found', async () => {
    vehicleRepo.findById.mockResolvedValue(null)
    const uc = new CreateServiceOrderUseCase(serviceOrderRepo, vehicleRepo, {} as any, userContext)

    const result = await uc.execute({ vehicleId: 'v-404' } as any)
    expect(result.isFailure).toBe(true)
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

    const uc = new CreateServiceOrderUseCase(serviceOrderRepo, vehicleRepo, {} as any, userContext)
    const res = await uc.execute({ vehicleId: 'v-1' } as any)

    expect(res.isSuccess).toBe(true)
    expect((res as any).value).toBeDefined()
  })

  it('returns Failure when repository.create throws DomainException-like error', async () => {
    const vehicle = { id: 'v-1', clientId: 'c-1' }
    vehicleRepo.findById.mockResolvedValue(vehicle)
    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)

    serviceOrderRepo.create.mockRejectedValue(new (class extends Error {})('domain'))
    const uc = new CreateServiceOrderUseCase(serviceOrderRepo, vehicleRepo, {} as any, userContext)
    const r = await uc.execute({ vehicleId: 'v-1' } as any)
    expect(r.isFailure).toBe(true)
  })

  it('returns Failure when repository.create throws generic Error', async () => {
    const vehicle = { id: 'v-1', clientId: 'c-1' }
    vehicleRepo.findById.mockResolvedValue(vehicle)
    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)

    serviceOrderRepo.create.mockRejectedValue(new Error('db'))
    const uc = new CreateServiceOrderUseCase(serviceOrderRepo, vehicleRepo, {} as any, userContext)
    const r = await uc.execute({ vehicleId: 'v-1' } as any)
    expect(r.isFailure).toBe(true)
  })
})
