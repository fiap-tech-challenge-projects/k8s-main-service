import { Logger } from '@nestjs/common'

import { DeleteVehicleUseCase } from '@application/vehicles'
import { InvalidValueException } from '@shared/exceptions'

describe('DeleteVehicleUseCase', () => {
  it('returns Success when vehicle exists and is deleted', async () => {
    const mockRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'v-1' }),
      delete: jest.fn().mockResolvedValue(true),
    }

    const useCase = new DeleteVehicleUseCase(mockRepo as any)
    const res = await useCase.execute('v-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toBe(true)
    expect(mockRepo.delete).toHaveBeenCalledWith('v-1')
  })

  it('returns Failure when vehicle not found', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new DeleteVehicleUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
  })

  it('logs a warning when vehicle not found', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new DeleteVehicleUseCase(mockRepo as any)

    const warnSpy = jest.spyOn(Logger.prototype, 'warn')

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const useCase = new DeleteVehicleUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
  })

  it('preserves DomainException and logs when repository throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    const mockRepo = { findById: jest.fn().mockRejectedValue(domainErr) }
    const useCase = new DeleteVehicleUseCase(mockRepo as any)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect((res as any).error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
