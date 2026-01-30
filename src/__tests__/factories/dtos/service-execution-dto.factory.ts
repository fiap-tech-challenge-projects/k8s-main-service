import { plainToClass } from 'class-transformer'

import {
  CreateServiceExecutionDto,
  UpdateServiceExecutionDto,
  ServiceExecutionResponseDto,
  PaginatedServiceExecutionsResponseDto,
} from '@application/service-executions/dto'
import { ServiceExecutionStatus } from '@domain/service-executions/entities'

/**
 * Factory for creating ServiceExecution DTOs for testing
 */
export class ServiceExecutionDtoFactory {
  /**
   * Create a valid CreateServiceExecutionDto
   * @param overrides - Optional properties to override defaults
   * @returns CreateServiceExecutionDto
   */
  public static createCreateDto(
    overrides: Partial<CreateServiceExecutionDto> = {},
  ): CreateServiceExecutionDto {
    const defaults: CreateServiceExecutionDto = {
      serviceOrderId: 'so-1234567890abcdef',
      mechanicId: 'emp-1234567890abcdef',
      notes: 'Oil change completed, filter replaced',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateServiceExecutionDto, data)
  }

  /**
   * Create a CreateServiceExecutionDto without mechanic
   * @param overrides - Optional properties to override defaults
   * @returns CreateServiceExecutionDto
   */
  public static createCreateDtoWithoutMechanic(
    overrides: Partial<CreateServiceExecutionDto> = {},
  ): CreateServiceExecutionDto {
    const defaults: CreateServiceExecutionDto = {
      serviceOrderId: 'so-1234567890abcdef',
      notes: 'Service order created without mechanic assignment',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateServiceExecutionDto, data)
  }

  /**
   * Create a valid UpdateServiceExecutionDto
   * @param overrides - Optional properties to override defaults
   * @returns UpdateServiceExecutionDto
   */
  public static createUpdateDto(
    overrides: Partial<UpdateServiceExecutionDto> = {},
  ): UpdateServiceExecutionDto {
    const defaults: UpdateServiceExecutionDto = {
      mechanicId: 'emp-9876543210fedcba',
      notes: 'Updated service execution notes',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateServiceExecutionDto, data)
  }

  /**
   * Create a valid ServiceExecutionResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns ServiceExecutionResponseDto
   */
  public static createResponseDto(
    overrides: Partial<ServiceExecutionResponseDto> = {},
  ): ServiceExecutionResponseDto {
    const defaults: ServiceExecutionResponseDto = {
      id: `service-execution-test-${Date.now()}`,
      serviceOrderId: 'so-1234567890abcdef',
      mechanicId: 'emp-1234567890abcdef',
      status: ServiceExecutionStatus.ASSIGNED,
      startTime: undefined,
      endTime: undefined,
      notes: 'Test service execution notes',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a PaginatedServiceExecutionsResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns PaginatedServiceExecutionsResponseDto
   */
  public static createPaginatedResponseDto(
    overrides: Partial<{
      data: ServiceExecutionResponseDto[]
      meta: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }> = {},
  ): PaginatedServiceExecutionsResponseDto {
    const serviceExecutionsData = overrides.data ?? [
      this.createResponseDto({ id: 'service-execution-1', serviceOrderId: 'so-1' }),
      this.createResponseDto({ id: 'service-execution-2', serviceOrderId: 'so-2' }),
      this.createResponseDto({ id: 'service-execution-3', serviceOrderId: 'so-3' }),
    ]

    const defaults = {
      data: serviceExecutionsData,
      meta: {
        total: serviceExecutionsData.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(serviceExecutionsData.length / 10),
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
   * Create an empty PaginatedServiceExecutionsResponseDto
   * @returns PaginatedServiceExecutionsResponseDto
   */
  public static createEmptyPaginatedResponseDto(): PaginatedServiceExecutionsResponseDto {
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
   * Create multiple CreateServiceExecutionDto instances
   * @param count - Number of DTOs to create
   * @param baseOverrides - Base overrides to apply to all DTOs
   * @returns Array of CreateServiceExecutionDto
   */
  public static createManyCreateDto(
    count: number,
    baseOverrides: Partial<CreateServiceExecutionDto> = {},
  ): CreateServiceExecutionDto[] {
    return Array.from({ length: count }, (_, index) =>
      this.createCreateDto({
        ...baseOverrides,
        serviceOrderId: baseOverrides.serviceOrderId ?? `so-${index + 1}`,
        mechanicId: baseOverrides.mechanicId ?? `emp-${index + 1}`,
        notes: baseOverrides.notes ?? `Service execution ${index + 1} notes`,
      }),
    )
  }
}
