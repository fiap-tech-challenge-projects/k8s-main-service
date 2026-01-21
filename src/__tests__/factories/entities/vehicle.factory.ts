import { Vehicle } from '@domain/vehicles/entities'
import { LicensePlate, Vin } from '@domain/vehicles/value-objects'

/**
 * Factory for creating Vehicle entities for testing
 */
export class VehicleFactory {
  /**
   * Create a valid Vehicle entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns Vehicle entity
   */
  public static create(
    overrides: Partial<{
      id: string
      licensePlate: string
      make: string
      model: string
      year: number
      clientId: string
      vin?: string
      color?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Vehicle {
    const defaults = {
      id: `vehicle-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      licensePlate: 'ABC1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      clientId: `client-test-${Date.now()}`,
      vin: '1HGBH41JXMN109186',
      color: 'White',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Vehicle(
      data.id,
      LicensePlate.create(data.licensePlate),
      data.make,
      data.model,
      data.year,
      data.clientId,
      data.vin ? Vin.create(data.vin) : undefined,
      data.color,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a minimal Vehicle entity with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns Vehicle entity
   */
  public static createMinimal(
    overrides: Partial<{
      id: string
      licensePlate: string
      make: string
      model: string
      year: number
      clientId: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Vehicle {
    const defaults = {
      id: `vehicle-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      licensePlate: 'XYZ5678',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      clientId: `client-test-${Date.now()}`,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Vehicle(
      data.id,
      LicensePlate.create(data.licensePlate),
      data.make,
      data.model,
      data.year,
      data.clientId,
      undefined,
      undefined,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a Vehicle entity with VIN
   * @param overrides - Optional properties to override defaults
   * @returns Vehicle entity
   */
  public static createWithVin(
    overrides: Partial<{
      id: string
      licensePlate: string
      make: string
      model: string
      year: number
      clientId: string
      vin: string
      color?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Vehicle {
    const defaults = {
      vin: '1HGBH41JXMN109186',
    }

    return this.create({
      ...defaults,
      ...overrides,
    })
  }

  /**
   * Create a Vehicle entity with specific make and model
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param overrides - Optional properties to override defaults
   * @returns Vehicle entity
   */
  public static createWithMakeModel(
    make: string,
    model: string,
    overrides: Partial<{
      id: string
      licensePlate: string
      year: number
      clientId: string
      vin?: string
      color?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Vehicle {
    const makeModelDefaults = {
      Toyota: { year: 2022, color: 'Silver' },
      Honda: { year: 2021, color: 'Black' },
      Ford: { year: 2020, color: 'Blue' },
      Chevrolet: { year: 2023, color: 'Red' },
    }

    const makeDefaults = makeModelDefaults[make as keyof typeof makeModelDefaults] || {}

    return this.create({
      ...makeDefaults,
      ...overrides,
      make,
      model,
    })
  }

  /**
   * Create an old Vehicle entity (year < 2010)
   * @param overrides - Optional properties to override defaults
   * @returns Vehicle entity
   */
  public static createOld(
    overrides: Partial<{
      id: string
      licensePlate: string
      make: string
      model: string
      year: number
      clientId: string
      vin?: string
      color?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Vehicle {
    return this.create({
      make: 'Volkswagen',
      model: 'Gol',
      year: 2005,
      color: 'White',
      ...overrides,
    })
  }

  /**
   * Create an array of Vehicle entities
   * @param count - Number of vehicles to create
   * @param baseOverrides - Base overrides to apply to all vehicles
   * @returns Array of Vehicle entities
   */
  public static createMany(
    count: number,
    baseOverrides: Partial<{
      make: string
      model: string
      year: number
      clientId: string
      color?: string
    }> = {},
  ): Vehicle[] {
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen']
    const models = ['Corolla', 'Civic', 'Focus', 'Onix', 'Gol']

    return Array.from({ length: count }, (_, index) => {
      const plateNumber = (1000 + index).toString()
      return this.create({
        ...baseOverrides,
        id: `vehicle-test-${index}-${Date.now()}`,
        licensePlate: `ABC${plateNumber}`,
        make: baseOverrides.make ?? makes[index % makes.length],
        model: baseOverrides.model ?? models[index % models.length],
        year: baseOverrides.year ?? 2020 + (index % 5),
      })
    })
  }
}
