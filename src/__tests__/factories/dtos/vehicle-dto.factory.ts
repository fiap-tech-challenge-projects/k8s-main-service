import { plainToClass } from 'class-transformer'

import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleResponseDto,
  PaginatedVehiclesResponseDto,
} from '@application/vehicles/dto'

/**
 * Factory for creating Vehicle DTOs for testing
 */
export class VehicleDtoFactory {
  /**
   * Create a valid CreateVehicleDto
   * @param overrides - Optional properties to override defaults
   * @returns CreateVehicleDto
   */
  public static createCreateVehicleDto(
    overrides: Partial<CreateVehicleDto> = {},
  ): CreateVehicleDto {
    const defaults: CreateVehicleDto = {
      licensePlate: 'ABC-1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      clientId: `client-test-${Date.now()}`,
      vin: '1HGBH41JXMN109186',
      color: 'White',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateVehicleDto, data)
  }

  /**
   * Create a minimal CreateVehicleDto with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns CreateVehicleDto
   */
  public static createMinimalCreateVehicleDto(
    overrides: Partial<CreateVehicleDto> = {},
  ): CreateVehicleDto {
    const defaults: CreateVehicleDto = {
      licensePlate: 'XYZ-5678',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      clientId: `client-test-${Date.now()}`,
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateVehicleDto, data)
  }

  /**
   * Create a CreateVehicleDto with specific make and model
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param overrides - Optional properties to override defaults
   * @returns CreateVehicleDto
   */
  public static createCreateVehicleDtoWithMakeModel(
    make: string,
    model: string,
    overrides: Partial<CreateVehicleDto> = {},
  ): CreateVehicleDto {
    const makeModelDefaults = {
      Toyota: { year: 2022, color: 'Silver' },
      Honda: { year: 2021, color: 'Black' },
      Ford: { year: 2020, color: 'Blue' },
      Chevrolet: { year: 2023, color: 'Red' },
    }

    const makeDefaults = makeModelDefaults[make as keyof typeof makeModelDefaults] || {}

    return this.createCreateVehicleDto({
      ...makeDefaults,
      ...overrides,
      make,
      model,
    })
  }

  /**
   * Create a valid UpdateVehicleDto
   * @param overrides - Optional properties to override defaults
   * @returns UpdateVehicleDto
   */
  public static createUpdateVehicleDto(
    overrides: Partial<UpdateVehicleDto> = {},
  ): UpdateVehicleDto {
    const defaults: UpdateVehicleDto = {
      licensePlate: 'ABC-9999',
      make: 'Toyota',
      model: 'Corolla XEI',
      year: 2023,
      vin: '1HGBH41JXMN109999',
      color: 'Silver',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateVehicleDto, data)
  }

  /**
   * Create a partial UpdateVehicleDto with only some fields
   * @param overrides - Optional properties to override defaults
   * @returns UpdateVehicleDto
   */
  public static createPartialUpdateVehicleDto(
    overrides: Partial<UpdateVehicleDto> = {},
  ): UpdateVehicleDto {
    const defaults: UpdateVehicleDto = {
      color: 'Blue',
      year: 2023,
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateVehicleDto, data)
  }

  /**
   * Create a valid VehicleResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns VehicleResponseDto
   */
  public static createVehicleResponseDto(
    overrides: Partial<VehicleResponseDto> = {},
  ): VehicleResponseDto {
    const defaults: VehicleResponseDto = {
      id: `vehicle-test-${Date.now()}`,
      licensePlate: 'ABC-1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      clientId: `client-test-${Date.now()}`,
      vin: '1HGBH41JXMN109186',
      color: 'White',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a minimal VehicleResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns VehicleResponseDto
   */
  public static createMinimalVehicleResponseDto(
    overrides: Partial<VehicleResponseDto> = {},
  ): VehicleResponseDto {
    const defaults: VehicleResponseDto = {
      id: `vehicle-test-${Date.now()}`,
      licensePlate: 'XYZ-5678',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      clientId: `client-test-${Date.now()}`,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a PaginatedVehiclesResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns PaginatedVehiclesResponseDto
   */
  public static createPaginatedVehiclesResponseDto(
    overrides: Partial<{
      data: VehicleResponseDto[]
      meta: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }> = {},
  ): PaginatedVehiclesResponseDto {
    const vehiclesData = overrides.data ?? [
      this.createVehicleResponseDto({ id: 'vehicle-1', licensePlate: 'ABC-1111', make: 'Toyota' }),
      this.createVehicleResponseDto({ id: 'vehicle-2', licensePlate: 'ABC-2222', make: 'Honda' }),
      this.createVehicleResponseDto({ id: 'vehicle-3', licensePlate: 'ABC-3333', make: 'Ford' }),
    ]

    const defaults = {
      data: vehiclesData,
      meta: {
        total: vehiclesData.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(vehiclesData.length / 10),
        hasNext: false,
        hasPrev: false,
      },
    }

    return {
      data: overrides.data ?? defaults.data,
      meta: overrides.meta ? { ...defaults.meta, ...overrides.meta } : defaults.meta,
    }
  }

  /**
   * Create an empty PaginatedVehiclesResponseDto
   * @returns PaginatedVehiclesResponseDto
   */
  public static createEmptyPaginatedVehiclesResponseDto(): PaginatedVehiclesResponseDto {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }

  /**
   * Create multiple CreateVehicleDto instances
   * @param count - Number of DTOs to create
   * @param baseOverrides - Base overrides to apply to all DTOs
   * @returns Array of CreateVehicleDto
   */
  public static createManyCreateVehicleDto(
    count: number,
    baseOverrides: Partial<CreateVehicleDto> = {},
  ): CreateVehicleDto[] {
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen']
    const models = ['Corolla', 'Civic', 'Focus', 'Onix', 'Gol']

    return Array.from({ length: count }, (_, index) => {
      const plateNumber = (1000 + index).toString()
      return this.createCreateVehicleDto({
        ...baseOverrides,
        licensePlate: `ABC-${plateNumber}`,
        make: baseOverrides.make ?? makes[index % makes.length],
        model: baseOverrides.model ?? models[index % models.length],
        year: baseOverrides.year ?? 2020 + (index % 5),
        clientId: baseOverrides.clientId ?? `client-test-${index}`,
      })
    })
  }
}
