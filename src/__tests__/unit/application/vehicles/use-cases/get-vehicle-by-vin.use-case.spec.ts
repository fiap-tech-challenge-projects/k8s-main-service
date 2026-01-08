import { Logger } from '@nestjs/common'

import { GetVehicleByVinUseCase, VehicleMapper } from '@application/vehicles'
import { InvalidValueException } from '@shared/exceptions'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils'

describe('GetVehicleByVinUseCase', () => {
  beforeAll(() => setupLoggerMock())
  afterAll(() => clearLoggerMocks())

  it('returns Success with vehicle dto when vehicle exists', async () => {
    const mockVehicle = { id: 'v-1', vin: 'VIN123' }
    const vehicleRepository = { findByVin: jest.fn().mockResolvedValue(mockVehicle) }

    jest.spyOn(VehicleMapper, 'toResponseDto').mockReturnValue({ id: 'v-1', vin: 'VIN123' } as any)

    const useCase = new GetVehicleByVinUseCase(vehicleRepository as any)
    const res = await useCase.execute('VIN123')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toEqual({ id: 'v-1', vin: 'VIN123' })
    expect(vehicleRepository.findByVin).toHaveBeenCalledWith('VIN123')

    jest.restoreAllMocks()
  })

  it('returns Failure when vehicle is not found', async () => {
    const vehicleRepository = { findByVin: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleByVinUseCase(vehicleRepository as any)

    const res = await useCase.execute('MISSINGVIN')

    expect(res.isFailure).toBe(true)
    expect(vehicleRepository.findByVin).toHaveBeenCalledWith('MISSINGVIN')
  })

  it('logs a warning when vehicle is not found', async () => {
    const vehicleRepository = { findByVin: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleByVinUseCase(vehicleRepository as any)

    const warnSpy = jest.spyOn(Logger.prototype, 'warn')

    const res = await useCase.execute('MISSINGVIN')

    expect(res.isFailure).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('returns Failure when repository throws', async () => {
    const vehicleRepository = { findByVin: jest.fn().mockRejectedValue(new Error('boom')) }
    const useCase = new GetVehicleByVinUseCase(vehicleRepository as any)

    const res = await useCase.execute('VINERROR')

    expect(res.isFailure).toBe(true)
  })

  it('preserves DomainException and logs when repository throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    const vehicleRepository = { findByVin: jest.fn().mockRejectedValue(domainErr) }
    const useCase = new GetVehicleByVinUseCase(vehicleRepository as any)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('VINERROR')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect((res as any).error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
