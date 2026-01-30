import {
  LicensePlateAlreadyExistsException,
  VinAlreadyExistsException,
} from '@domain/vehicles/exceptions'
import { VehicleUpdateValidator } from '@domain/vehicles/validators'

describe('VehicleUpdateValidator', () => {
  it('does not throw when license plate is available', async () => {
    const fn = jest.fn().mockResolvedValue(false)
    await expect(
      VehicleUpdateValidator.validateLicensePlateAvailabilityForUpdate('ABC-1234', 'v1', fn),
    ).resolves.toBeUndefined()
    expect(fn).toHaveBeenCalledWith('ABC-1234', 'v1')
  })

  it('throws when license plate exists for another vehicle', async () => {
    const fn = jest.fn().mockResolvedValue(true)
    await expect(
      VehicleUpdateValidator.validateLicensePlateAvailabilityForUpdate('ABC-1234', 'v1', fn),
    ).rejects.toThrow(LicensePlateAlreadyExistsException)
  })

  it('throws when vin exists for another vehicle', async () => {
    const fn = jest.fn().mockResolvedValue(true)
    await expect(
      VehicleUpdateValidator.validateVinAvailabilityForUpdate('VIN123', 'v1', fn),
    ).rejects.toThrow(VinAlreadyExistsException)
  })
})
