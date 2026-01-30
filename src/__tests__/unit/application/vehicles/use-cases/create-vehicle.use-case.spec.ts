import { Logger } from '@nestjs/common'

import { VehicleMapper } from '@application/vehicles/mappers'
import { CreateVehicleUseCase } from '@application/vehicles/use-cases'
import { InvalidValueException } from '@shared/exceptions'
import { Success, Failure } from '@shared/types'

describe('CreateVehicleUseCase (pure unit)', () => {
  let useCase: CreateVehicleUseCase
  const mockRepo = { create: jest.fn() }

  const dto = {
    licensePlate: 'ABC-1234',
    make: 'Make',
    model: 'Model',
    year: 2020,
    clientId: 'c-1',
    // use a realistic 17-char VIN so the Vin value-object validation passes
    vin: '1HGBH41JXMN109186',
    color: 'red',
  }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockRepo.create.mockReset()

    useCase = new CreateVehicleUseCase(mockRepo as any)
  })

  afterAll(() => jest.restoreAllMocks())

  it('creates vehicle and returns mapped dto on success', async () => {
    const saved = { id: 'v1', ...dto }
    mockRepo.create.mockResolvedValue(saved)
    const mapSpy = jest.spyOn(VehicleMapper, 'toResponseDto').mockReturnValue(saved as any)

    const res = await useCase.execute(dto as any)

    expect(mockRepo.create).toHaveBeenCalled()
    expect(mapSpy).toHaveBeenCalledWith(saved)
    expect(res).toBeInstanceOf(Success)
    if (res instanceof Success) expect(res.value).toEqual(saved)
  })

  it('returns Failure wrapping InvalidValueException when repo.create throws', async () => {
    mockRepo.create.mockRejectedValue(new Error('db'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute(dto as any)

    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBeInstanceOf(InvalidValueException)
    expect(errSpy).toHaveBeenCalled()
  })

  it('returns Failure when Vehicle.create throws (invalid input) and does not call repo', async () => {
    // invalid license plate will make LicensePlate.create throw
    const badDto = { ...dto, licensePlate: 'X' }

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute(badDto as any)

    expect(mockRepo.create).not.toHaveBeenCalled()
    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBeInstanceOf(InvalidValueException)
    expect(errSpy).toHaveBeenCalled()
  })

  it('preserves DomainException returned by repository and logs error', async () => {
    const domainErr = new InvalidValueException('repo', 'boom')
    mockRepo.create.mockRejectedValue(domainErr)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute(dto as any)

    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
