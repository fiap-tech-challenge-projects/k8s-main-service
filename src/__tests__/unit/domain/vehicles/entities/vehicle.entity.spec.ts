import { Vehicle } from '@domain/vehicles/entities'
import { InvalidValueException } from '@shared'

describe('Vehicle Entity', () => {
  it('should create vehicle with required fields', () => {
    const vehicle = Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123')

    expect(vehicle.licensePlate.formatted).toBe('ABC-1234')
    expect(vehicle.make).toBe('Toyota')
    expect(vehicle.model).toBe('Corolla')
    expect(vehicle.year).toBe(2020)
    expect(vehicle.clientId).toBe('client-123')
    expect(vehicle.vin).toBeUndefined()
    expect(vehicle.color).toBeUndefined()
  })

  it('should create vehicle with optional fields', () => {
    const vehicle = Vehicle.create(
      'XYZ-5678',
      'Honda',
      'Civic',
      2021,
      'client-456',
      '1HGBH41JXMN109186',
      'Red',
    )

    expect(vehicle.licensePlate.formatted).toBe('XYZ-5678')
    expect(vehicle.make).toBe('Honda')
    expect(vehicle.model).toBe('Civic')
    expect(vehicle.year).toBe(2021)
    expect(vehicle.clientId).toBe('client-456')
    expect(vehicle.vin?.formatted).toBe('1HGB-H41JX-MN109-186')
    expect(vehicle.color).toBe('Red')
  })

  it('should create vehicle with explicit dates', () => {
    const createdAt = new Date('2023-01-01')
    const updatedAt = new Date('2023-01-02')
    const licensePlate = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
    ).licensePlate

    const vehicle = new Vehicle(
      'vehicle-123',
      licensePlate,
      'Toyota',
      'Corolla',
      2020,
      'client-123',
      undefined,
      undefined,
      createdAt,
      updatedAt,
    )

    expect(vehicle.createdAt).toBe(createdAt)
    expect(vehicle.updatedAt).toBe(updatedAt)
  })

  it('should create vehicle with default dates', () => {
    const licensePlate = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
    ).licensePlate
    const beforeCreation = new Date()

    const vehicle = new Vehicle(
      'vehicle-123',
      licensePlate,
      'Toyota',
      'Corolla',
      2020,
      'client-123',
    )

    const afterCreation = new Date()
    expect(vehicle.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
    expect(vehicle.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
    expect(vehicle.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
  })

  it('should throw for invalid license plate', () => {
    expect(() => Vehicle.create('invalid', 'Toyota', 'Corolla', 2020, 'client-123')).toThrow(
      InvalidValueException,
    )
  })

  it('should throw for invalid VIN', () => {
    expect(() =>
      Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123', 'invalid'),
    ).toThrow(InvalidValueException)
  })

  it('should update vehicle fields individually', () => {
    const vehicle = Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123')

    // Test individual update methods
    vehicle.updateLicensePlate('XYZ-5678')
    vehicle.updateMake('Honda')
    vehicle.updateModel('Civic')
    vehicle.updateYear(2021)
    vehicle.updateVin('1HGBH41JXMN109186')
    vehicle.updateColor('Blue')

    expect(vehicle.licensePlate.formatted).toBe('XYZ-5678')
    expect(vehicle.make).toBe('Honda')
    expect(vehicle.model).toBe('Civic')
    expect(vehicle.year).toBe(2021)
    expect(vehicle.vin?.formatted).toBe('1HGB-H41JX-MN109-186')
    expect(vehicle.color).toBe('Blue')
  })

  it('should update only provided fields using individual methods', () => {
    const vehicle = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
      '1HGBH41JXMN109186',
      'Red',
    )

    // Update only the make
    vehicle.updateMake('Honda')

    expect(vehicle.licensePlate.formatted).toBe('ABC-1234')
    expect(vehicle.make).toBe('Honda')
    expect(vehicle.model).toBe('Corolla')
    expect(vehicle.year).toBe(2020)
    expect(vehicle.vin?.formatted).toBe('1HGB-H41JX-MN109-186')
    expect(vehicle.color).toBe('Red')
  })

  it('should check if vehicle has VIN', () => {
    const vehicleWithVin = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
      '1HGBH41JXMN109186',
    )
    const vehicleWithoutVin = Vehicle.create('XYZ-5678', 'Honda', 'Civic', 2021, 'client-456')

    expect(vehicleWithVin.hasVin()).toBe(true)
    expect(vehicleWithoutVin.hasVin()).toBe(false)
  })

  it('should check if vehicle has color', () => {
    const vehicleWithColor = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
      undefined,
      'Red',
    )
    const vehicleWithoutColor = Vehicle.create('XYZ-5678', 'Honda', 'Civic', 2021, 'client-456')
    const vehicleWithEmptyColor = Vehicle.create(
      'DEF-9012',
      'Ford',
      'Focus',
      2019,
      'client-789',
      undefined,
      '',
    )

    expect(vehicleWithColor.hasColor()).toBe(true)
    expect(vehicleWithoutColor.hasColor()).toBe(false)
    expect(vehicleWithEmptyColor.hasColor()).toBe(false)
  })

  it('should get formatted license plate', () => {
    const vehicle = Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123')
    expect(vehicle.getFormattedLicensePlate()).toBe('ABC-1234')
  })

  it('should get clean license plate', () => {
    const vehicle = Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123')
    expect(vehicle.getCleanLicensePlate()).toBe('ABC1234')
  })

  it('should get formatted VIN when available', () => {
    const vehicle = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
      '1HGBH41JXMN109186',
    )
    expect(vehicle.getFormattedVin()).toBe('1HGB-H41JX-MN109-186')
  })

  it('should return undefined for formatted VIN when not available', () => {
    const vehicle = Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123')
    expect(vehicle.getFormattedVin()).toBeUndefined()
  })

  it('should get clean VIN when available', () => {
    const vehicle = Vehicle.create(
      'ABC-1234',
      'Toyota',
      'Corolla',
      2020,
      'client-123',
      '1HGBH41JXMN109186',
    )
    expect(vehicle.getCleanVin()).toBe('1HGBH41JXMN109186')
  })

  it('should return undefined for clean VIN when not available', () => {
    const vehicle = Vehicle.create('ABC-1234', 'Toyota', 'Corolla', 2020, 'client-123')
    expect(vehicle.getCleanVin()).toBeUndefined()
  })
})
