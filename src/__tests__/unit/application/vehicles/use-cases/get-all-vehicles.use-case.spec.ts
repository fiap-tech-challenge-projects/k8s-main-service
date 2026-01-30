import { Logger } from '@nestjs/common'

import { VehicleMapper } from '@application/vehicles/mappers'
import { GetAllVehiclesUseCase } from '@application/vehicles/use-cases'
import { InvalidValueException } from '@shared/exceptions'

describe('GetAllVehiclesUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetAllVehiclesUseCase

  beforeEach(() => {
    mockRepo = { findAll: jest.fn() }
    jest.spyOn(VehicleMapper, 'toResponseDto').mockImplementation((v: any) => ({ id: v.id }) as any)
    useCase = new GetAllVehiclesUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with mapped data', async () => {
    mockRepo.findAll.mockResolvedValue({
      data: [{ id: 'v-1' }],
      meta: { total: 1, totalPages: 1, page: 1 },
    })
    const result = await useCase.execute(1, 10)
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value.data).toHaveLength(1)
  })

  it('returns Failure on repo error', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('db'))
    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const result = await useCase.execute()
    expect(result.isFailure).toBeTruthy()
    expect(errSpy).toHaveBeenCalled()
  })

  it('preserves DomainException and logs when repository throws DomainException', async () => {
    const domainErr = new InvalidValueException('x', 'boom')
    mockRepo.findAll.mockRejectedValue(domainErr)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const result = await useCase.execute()

    expect(result.isFailure).toBeTruthy()
    expect(errSpy).toHaveBeenCalled()
  })
})
