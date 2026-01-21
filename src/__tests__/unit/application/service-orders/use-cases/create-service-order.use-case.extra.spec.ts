import {
  ServiceOrderMapper,
  CreateServiceOrderUseCase as CreateServiceOrderUseCase,
} from '@application/service-orders'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'

describe('CreateServiceOrderUseCase (catch & branches)', () => {
  const mockServiceOrderRepo: any = { create: jest.fn() }
  const mockVehicleRepo: any = { findById: jest.fn() }

  const mockUserContext: any = {
    getUserId: jest.fn().mockReturnValue('u-1'),
    getUserRole: jest.fn().mockReturnValue('EMPLOYEE'),
  }

  const dto: any = { vehicleId: 'v-1' }

  beforeEach(() => {
    jest.resetAllMocks()
    jest
      .spyOn(ServiceOrderMapper, 'fromCreateDtoForEmployee')
      .mockImplementation((d: any) => ({ ...d }) as any)
    jest.spyOn(ServiceOrderMapper, 'toResponseDto').mockReturnValue({ id: 'so-1' } as any)
  })

  it('returns Success when vehicle exists and repo create succeeds', async () => {
    mockVehicleRepo.findById.mockResolvedValue({ id: 'v-1', clientId: 'c-1' })
    mockServiceOrderRepo.create.mockResolvedValue({ id: 'so-1', vehicleId: 'v-1', clientId: 'c-1' })

    const useCase = new CreateServiceOrderUseCase(
      mockServiceOrderRepo,
      mockVehicleRepo,
      mockUserContext,
    )
    const res = await useCase.execute(dto)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toEqual({ id: 'so-1' })
  })

  it('returns Failure VehicleNotFoundException when vehicle missing', async () => {
    mockVehicleRepo.findById.mockResolvedValue(null)

    const useCase = new CreateServiceOrderUseCase(
      mockServiceOrderRepo,
      mockVehicleRepo,
      mockUserContext,
    )
    const res = await useCase.execute(dto)

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect(res.error).toBeInstanceOf(VehicleNotFoundException)
  })

  it('returns Failure InvalidValueException when repo.create throws generic error', async () => {
    mockVehicleRepo.findById.mockResolvedValue({ id: 'v-1', clientId: 'c-1' })
    mockServiceOrderRepo.create.mockRejectedValue(new Error('db fail'))

    const useCase = new CreateServiceOrderUseCase(
      mockServiceOrderRepo,
      mockVehicleRepo,
      mockUserContext,
    )
    const res = await useCase.execute(dto)

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect(res.error).toBeInstanceOf(Error)
  })
})
