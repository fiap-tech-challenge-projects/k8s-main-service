import { Logger } from '@nestjs/common'

import { GetVehicleByLicensePlateUseCase, VehicleMapper } from '@application/vehicles'
import { InvalidValueException } from '@shared/exceptions'

describe('GetVehicleByLicensePlateUseCase', () => {
  it('returns Success when found by license plate', async () => {
    const mockRepo = { findByLicensePlate: jest.fn().mockResolvedValue({ id: 'v-1' }) }

    jest
      .spyOn(VehicleMapper, 'toResponseDto')
      .mockReturnValue({ id: 'v-1', licensePlate: 'ABC-1234' } as any)

    const useCase = new GetVehicleByLicensePlateUseCase(mockRepo as any)
    const res = await useCase.execute('ABC-1234')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.licensePlate).toBe('ABC-1234')
  })

  it('returns Failure when not found', async () => {
    const mockRepo = { findByLicensePlate: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleByLicensePlateUseCase(mockRepo as any)

    const res = await useCase.execute('ABC-1234')

    expect(res.isFailure).toBe(true)
  })

  it('logs a warning when not found', async () => {
    const mockRepo = { findByLicensePlate: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleByLicensePlateUseCase(mockRepo as any)

    const warnSpy = jest.spyOn(Logger.prototype, 'warn')

    const res = await useCase.execute('ABC-1234')

    expect(res.isFailure).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { findByLicensePlate: jest.fn().mockRejectedValue(new Error('boom')) }
    const useCase = new GetVehicleByLicensePlateUseCase(mockRepo as any)

    const res = await useCase.execute('ABC-1234')

    expect(res.isFailure).toBe(true)
  })

  it('preserves DomainException and logs when repository throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    const mockRepo = { findByLicensePlate: jest.fn().mockRejectedValue(domainErr) }
    const useCase = new GetVehicleByLicensePlateUseCase(mockRepo as any)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('ABC-1234')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect((res as any).error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
