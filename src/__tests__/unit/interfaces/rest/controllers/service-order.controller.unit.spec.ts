import { HttpStatus, Logger } from '@nestjs/common'

import { ServiceOrderPresenter } from '@application/service-orders/presenters'
import { ServiceOrderController } from '@interfaces/rest/controllers'

describe('ServiceOrderController (unit)', () => {
  let controller: ServiceOrderController
  let mockCreate: any

  beforeEach(() => {
    mockCreate = { execute: jest.fn() }
    // other dependencies can be dummy objects since controller only uses create in this test
    controller = new ServiceOrderController(
      {} as any, // presenter
      mockCreate,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    )
    // Silence any Logger created inside controller or called by use-cases
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => undefined)
  })

  afterEach(() => jest.clearAllMocks())

  it('create returns presenter output when use-case succeeds', async () => {
    const dto = { vehicleId: 'v1' }
    const created = { id: 'so1', vehicleId: 'v1' }
    mockCreate.execute.mockResolvedValue({ isSuccess: true, value: created })

    // spy on static presenter method
    jest.spyOn(ServiceOrderPresenter, 'presentCreateSuccess').mockReturnValue({
      statusCode: HttpStatus.CREATED,
      message: 'ok',
      data: created,
    } as any)

    const out = await controller.create(dto as any)

    expect(mockCreate.execute).toHaveBeenCalledWith(dto)
    expect(out.statusCode).toBe(HttpStatus.CREATED)
    expect(out.data).toEqual(created)
  })

  it('create throws when use-case fails', async () => {
    const dto = { vehicleId: 'v2' }
    const err = new Error('bad')
    mockCreate.execute.mockResolvedValue({ isSuccess: false, error: err })

    await expect(controller.create(dto as any)).rejects.toBe(err)
  })
})
