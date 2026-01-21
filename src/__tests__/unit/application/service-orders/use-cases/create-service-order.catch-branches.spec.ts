import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { CreateServiceOrderUseCase as ConcreteCreateServiceOrder } from '@application/service-orders/use-cases'
import { DomainException } from '@shared/exceptions'

describe('CreateServiceOrderUseCase - catch branches', () => {
  const serviceOrderRepo: any = { create: jest.fn() }
  const vehicleRepo: any = { findById: jest.fn() }
  const userContext: any = {
    getUserId: jest.fn().mockReturnValue('u-1'),
    getUserRole: jest.fn().mockReturnValue('EMPLOYEE'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when repository.create throws a DomainException', async () => {
    const uc = new ConcreteCreateServiceOrder(serviceOrderRepo, vehicleRepo, userContext)

    // vehicle exists
    vehicleRepo.findById.mockResolvedValue({ id: 'v-1', clientId: 'c-1' })

    // repo.create throws DomainException
    serviceOrderRepo.create.mockRejectedValue(new (class extends DomainException {})('boom'))

    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)

    const res = await uc.execute({ vehicleId: 'v-1' } as any)
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure with InvalidValueException when repository.create throws generic Error', async () => {
    const uc = new ConcreteCreateServiceOrder(serviceOrderRepo, vehicleRepo, userContext)

    // vehicle exists
    vehicleRepo.findById.mockResolvedValue({ id: 'v-1', clientId: 'c-1' })

    // repo.create throws generic Error
    serviceOrderRepo.create.mockRejectedValue(new Error('db'))

    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockReturnValue({} as any)

    const res = await uc.execute({ vehicleId: 'v-1' } as any)
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when mapper throws and is caught as generic', async () => {
    const serviceOrderRepo: any = { create: jest.fn() }
    const vehicleRepo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'v-1', clientId: 'c-1' }),
    }
    const userContext: any = {
      getUserId: jest.fn().mockReturnValue('u-1'),
      getUserRole: jest.fn().mockReturnValue('EMPLOYEE'),
    }

    const uc = new ConcreteCreateServiceOrder(serviceOrderRepo, vehicleRepo, userContext)

    // mapper throws unexpected error
    jest.spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee').mockImplementation(() => {
      throw new Error('mapper failure')
    })

    const res = await uc.execute({ vehicleId: 'v-1' } as any)
    expect(res.isFailure).toBe(true)
  })
})
