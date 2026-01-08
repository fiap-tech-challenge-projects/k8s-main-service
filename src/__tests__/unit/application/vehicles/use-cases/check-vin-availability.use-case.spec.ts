import { Logger } from '@nestjs/common'

import { CheckVinAvailabilityUseCase } from '@application/vehicles/use-cases'
import { InvalidValueException } from '@shared/exceptions'
import { Success, Failure } from '@shared/types'

describe('CheckVinAvailabilityUseCase (pure unit)', () => {
  let useCase: CheckVinAvailabilityUseCase
  const mockRepo = { vinExists: jest.fn() }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockRepo.vinExists.mockReset()

    useCase = new CheckVinAvailabilityUseCase(mockRepo as any)
  })

  afterAll(() => jest.restoreAllMocks())

  it('returns available true when VIN does not exist', async () => {
    mockRepo.vinExists.mockResolvedValue(false)

    const res = await useCase.execute('VIN123')

    expect(mockRepo.vinExists).toHaveBeenCalledWith('VIN123')
    expect(res).toBeInstanceOf(Success)
    if (res instanceof Success) expect(res.value).toEqual({ available: true })
  })

  it('returns available false when VIN exists', async () => {
    mockRepo.vinExists.mockResolvedValue(true)

    const res = await useCase.execute('VIN123')

    expect(res).toBeInstanceOf(Success)
    if (res instanceof Success) expect(res.value).toEqual({ available: false })
  })

  it('returns Failure wrapping InvalidValueException on repo error', async () => {
    mockRepo.vinExists.mockRejectedValue(new Error('db'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('VINX')

    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBeInstanceOf(InvalidValueException)
    expect(errSpy).toHaveBeenCalled()
  })

  it('returns Failure with DomainException preserved when repo throws a DomainException instance', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    mockRepo.vinExists.mockRejectedValue(domainErr)
    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await useCase.execute('1HGBH41JXMN109186')

    expect(res).toBeInstanceOf(Failure)
    if (res instanceof Failure) expect(res.error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})
