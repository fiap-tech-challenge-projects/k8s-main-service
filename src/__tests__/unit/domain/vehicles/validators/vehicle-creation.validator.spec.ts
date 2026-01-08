import {
  LicensePlateAlreadyExistsException,
  VinAlreadyExistsException,
} from '@domain/vehicles/exceptions'
import { VehicleCreationValidator } from '@domain/vehicles/validators'

describe('VehicleCreationValidator', () => {
  it('throws when license plate exists', async () => {
    const licensePlateExists = jest.fn().mockResolvedValue(true)
    await expect(
      VehicleCreationValidator.validateLicensePlateAvailability('ABC-1234', licensePlateExists),
    ).rejects.toBeInstanceOf(LicensePlateAlreadyExistsException)
    expect(licensePlateExists).toHaveBeenCalledWith('ABC-1234')
  })

  it('does not throw when license plate does not exist', async () => {
    const licensePlateExists = jest.fn().mockResolvedValue(false)
    await expect(
      VehicleCreationValidator.validateLicensePlateAvailability('ABC-1234', licensePlateExists),
    ).resolves.toBeUndefined()
  })

  it('throws when vin exists and validateVehicleUniqueness calls both checks', async () => {
    const licensePlateExists = jest.fn().mockResolvedValue(false)
    const vinExists = jest.fn().mockResolvedValue(true)
    await expect(
      VehicleCreationValidator.validateVehicleUniqueness(
        'ABC-1234',
        'VIN1',
        licensePlateExists,
        vinExists,
      ),
    ).rejects.toBeInstanceOf(VinAlreadyExistsException)
    expect(vinExists).toHaveBeenCalledWith('VIN1')
  })
})
