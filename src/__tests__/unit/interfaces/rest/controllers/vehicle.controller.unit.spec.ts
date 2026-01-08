import { VehicleController } from '@interfaces/rest/controllers'

describe('VehicleController (unit)', () => {
  let controller: VehicleController
  let mockCreate: any
  let mockGetByLicense: any

  beforeEach(() => {
    mockCreate = { execute: jest.fn() }
    mockGetByLicense = { execute: jest.fn() }

    controller = new VehicleController(
      mockCreate,
      {} as any,
      mockGetByLicense,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('createVehicle returns value when use-case succeeds', async () => {
    const dto = { vin: 'VIN1' }
    const created = { id: 'v1', vin: 'VIN1' }
    mockCreate.execute.mockResolvedValue({ isSuccess: true, value: created })

    const out = await controller.createVehicle(dto as any)

    expect(mockCreate.execute).toHaveBeenCalledWith(dto)
    expect(out).toEqual(created)
  })

  it('getVehicleByLicensePlate throws when use-case fails', async () => {
    const err = new Error('not found')
    mockGetByLicense.execute.mockResolvedValue({ isSuccess: false, error: err })

    await expect(controller.getVehicleByLicensePlate('ABC-1234')).rejects.toBe(err)
  })
})
