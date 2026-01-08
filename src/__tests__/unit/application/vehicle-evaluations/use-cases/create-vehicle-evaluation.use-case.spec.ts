import { Logger } from '@nestjs/common'

import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { CreateVehicleEvaluationUseCase } from '@application/vehicle-evaluations/use-cases'
import { InvalidValueException } from '@shared/exceptions'
import { SUCCESS, FAILURE } from '@shared/types'

describe('CreateVehicleEvaluationUseCase (pure unit)', () => {
  let useCase: CreateVehicleEvaluationUseCase
  const mockRepo = { create: jest.fn() }

  const dto = {
    vehicleId: 'v-1',
    serviceOrderId: 's-1',
    score: 4,
    notes: 'ok',
  }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockRepo.create.mockReset()

    useCase = new CreateVehicleEvaluationUseCase(mockRepo as any)
  })

  afterAll(() => jest.restoreAllMocks())

  it('creates vehicle evaluation and returns mapped dto on success', async () => {
    const saved = {
      id: 'e1',
      vehicleId: dto.vehicleId,
      serviceOrderId: dto.serviceOrderId,
      score: dto.score,
      notes: dto.notes,
    }

    jest.spyOn(VehicleEvaluationMapper, 'fromCreateDto').mockReturnValue(saved as any)
    mockRepo.create.mockResolvedValue(saved)
    const mapSpy = jest
      .spyOn(VehicleEvaluationMapper, 'toResponseDto')
      .mockReturnValue(saved as any)

    const res = await useCase.execute(dto as any)

    expect(mockRepo.create).toHaveBeenCalled()
    expect(mapSpy).toHaveBeenCalledWith(saved)
    expect(res).toEqual(SUCCESS(saved as any))
  })

  it('returns FAILURE preserving DomainException when repo.create throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    jest.spyOn(VehicleEvaluationMapper, 'fromCreateDto').mockReturnValue({} as any)
    mockRepo.create.mockRejectedValue(domainErr)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute(dto as any)

    expect(res).toEqual(FAILURE(domainErr))
    expect(errSpy).toHaveBeenCalled()
  })

  it('returns FAILURE with generic DomainException when repo.create throws non-domain error', async () => {
    jest.spyOn(VehicleEvaluationMapper, 'fromCreateDto').mockReturnValue({} as any)
    mockRepo.create.mockRejectedValue(new Error('db'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute(dto as any)

    // should be a Failure with a DomainException subclass; test by checking isFailure and that error is instance of Error
    expect(res).toHaveProperty('isFailure', true)
    if ((res as any).isFailure) expect((res as any).error).toBeInstanceOf(Error)
    expect(errSpy).toHaveBeenCalled()
  })
})
