import { Logger } from '@nestjs/common'

import { GetVehicleByIdUseCase, VehicleMapper } from '@application/vehicles'
import { InvalidValueException } from '@shared/exceptions'

describe('GetVehicleByIdUseCase', () => {
  it('returns Success when vehicle exists', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue({ id: 'v-1' }) }

    jest
      .spyOn(VehicleMapper, 'toResponseDto')
      .mockReturnValue({ id: 'v-1', licensePlate: 'ABC-1234' } as any)

    const useCase = new GetVehicleByIdUseCase(mockRepo as any)
    const res = await useCase.execute('v-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('v-1')
  })

  it('returns Failure when vehicle not found', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleByIdUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
  })

  it('logs a warning when vehicle not found', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleByIdUseCase(mockRepo as any)

    const warnSpy = jest.spyOn(Logger.prototype, 'warn')

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('returns failure when repository throws', async () => {
    const mockRepo = { findById: jest.fn().mockRejectedValue(new Error('db fail')) }
    const useCase = new GetVehicleByIdUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')
    expect(res.isFailure).toBe(true)
  })

  it('preserves DomainException and logs when repository throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    const mockRepo = { findById: jest.fn().mockRejectedValue(domainErr) }
    const useCase = new GetVehicleByIdUseCase(mockRepo as any)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect((res as any).error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
