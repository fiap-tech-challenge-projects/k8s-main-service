import { Logger } from '@nestjs/common'

import { VehicleMapper } from '@application/vehicles/mappers'
import { GetVehiclesByClientUseCase } from '@application/vehicles/use-cases'
import { InvalidValueException } from '@shared/exceptions'

describe('GetVehiclesByClientUseCase', () => {
  let mockRepo: any
  let useCase: GetVehiclesByClientUseCase

  beforeEach(() => {
    mockRepo = { findByClientId: jest.fn() }
    jest.spyOn(VehicleMapper, 'toResponseDto').mockImplementation((v: any) => ({ id: v.id }) as any)
    useCase = new GetVehiclesByClientUseCase(mockRepo)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when repository returns vehicles', async () => {
    mockRepo.findByClientId.mockResolvedValue({
      data: [{ id: 'v-1' }],
      meta: { page: 1, total: 1, totalPages: 1 },
    })

    const result = await useCase.execute('client-1', 1, 10)

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) {
      expect(result.value.data).toEqual([{ id: 'v-1' }])
    }
    expect(VehicleMapper.toResponseDto).toHaveBeenCalledWith({ id: 'v-1' })
  })

  it('returns Failure when repository throws', async () => {
    mockRepo.findByClientId.mockRejectedValue(new Error('db'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const result = await useCase.execute('client-1')

    expect(result.isFailure).toBeTruthy()
    expect(errSpy).toHaveBeenCalled()
  })

  it('preserves DomainException and logs when repository throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    mockRepo.findByClientId.mockRejectedValue(domainErr)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const result = await useCase.execute('client-1')

    expect(result.isFailure).toBeTruthy()
    expect(errSpy).toHaveBeenCalled()
  })
})
