import { Logger } from '@nestjs/common'

import { CheckLicensePlateAvailabilityUseCase } from '@application/vehicles/use-cases'
import { InvalidValueException } from '@shared/exceptions'
import { Success, Failure } from '@shared/types'

describe('CheckLicensePlateAvailabilityUseCase (pure unit)', () => {
  let useCase: CheckLicensePlateAvailabilityUseCase
  const mockRepo = { licensePlateExists: jest.fn() }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockRepo.licensePlateExists.mockReset()

    useCase = new CheckLicensePlateAvailabilityUseCase(mockRepo as any)
  })

  afterAll(() => jest.restoreAllMocks())

  it('returns available true when license plate does not exist', async () => {
    mockRepo.licensePlateExists.mockResolvedValue(false)

    const res = await useCase.execute('ABC-1234')

    expect(mockRepo.licensePlateExists).toHaveBeenCalledWith('ABC-1234')
    expect(res).toBeInstanceOf(Success)
    if (res instanceof Success) expect(res.value).toEqual({ available: true })
  })

  it('returns available false when license plate exists', async () => {
    mockRepo.licensePlateExists.mockResolvedValue(true)

    const res = await useCase.execute('ABC-1234')

    expect(res).toBeInstanceOf(Success)
    if (res instanceof Success) expect(res.value).toEqual({ available: false })
  })

  it('returns Failure wrapping InvalidValueException on repo error', async () => {
    mockRepo.licensePlateExists.mockRejectedValue(new Error('db'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('X')

    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBeInstanceOf(InvalidValueException)
    expect(errSpy).toHaveBeenCalled()
  })

  it('returns Failure with DomainException preserved when repo throws a DomainException instance', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    mockRepo.licensePlateExists.mockRejectedValue(domainErr)
    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('ABC-1234')

    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
