import { ServiceOrderStatus } from '@prisma/client'

import {
  CreateServiceOrderDto,
  PaginatedServiceOrdersResponseDto,
  ServiceOrderResponseDto,
  UpdateServiceOrderDto,
} from '@application/service-orders/dto'

/**
 * Factory for creating service order DTOs for testing purposes
 */
export class ServiceOrderDtoFactory {
  /**
   * Creates a valid CreateServiceOrderDto for testing
   * @param overrides - Optional overrides for the default values
   * @returns CreateServiceOrderDto instance
   */
  static createCreateDto(overrides: Partial<CreateServiceOrderDto> = {}): CreateServiceOrderDto {
    return {
      vehicleId: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      notes: 'Test service order notes',
      ...overrides,
    }
  }

  /**
   * Creates a valid UpdateServiceOrderDto for testing
   * @param overrides - Optional overrides for the default values
   * @returns UpdateServiceOrderDto instance
   */
  static createUpdateDto(overrides: Partial<UpdateServiceOrderDto> = {}): UpdateServiceOrderDto {
    return {
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      notes: 'Updated test service order notes',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      ...overrides,
    }
  }

  /**
   * Creates a valid ServiceOrderResponseDto for testing
   * @param overrides - Optional overrides for the default values
   * @returns ServiceOrderResponseDto instance
   */
  static createResponseDto(
    overrides: Partial<ServiceOrderResponseDto> = {},
  ): ServiceOrderResponseDto {
    const now = new Date()
    return {
      id: `so-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: ServiceOrderStatus.REQUESTED,
      requestDate: now,
      deliveryDate: undefined,
      cancellationReason: undefined,
      notes: 'Test service order notes',
      clientId: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vehicleId: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    }
  }

  /**
   * Creates an array of ServiceOrderResponseDto for testing
   * @param count - Number of DTOs to create
   * @param overrides - Optional overrides for the default values
   * @returns Array of ServiceOrderResponseDto instances
   */
  static createResponseDtoArray(
    count: number,
    overrides: Partial<ServiceOrderResponseDto> = {},
  ): ServiceOrderResponseDto[] {
    return Array.from({ length: count }, (_, index) =>
      this.createResponseDto({
        id: `so-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        ...overrides,
      }),
    )
  }

  /**
   * Creates a valid PaginatedServiceOrdersResponseDto for testing
   * @param count - Number of service orders in the data array
   * @param overrides - Optional overrides for the default values
   * @returns PaginatedServiceOrdersResponseDto instance
   */
  static createPaginatedResponseDto(
    count: number = 5,
    overrides: Partial<PaginatedServiceOrdersResponseDto> = {},
  ): PaginatedServiceOrdersResponseDto {
    return {
      data: this.createResponseDtoArray(count),
      meta: {
        page: 1,
        limit: 10,
        total: count,
        totalPages: Math.ceil(count / 10),
        hasNext: false,
        hasPrev: false,
      },
      ...overrides,
    }
  }

  /**
   * Creates a CreateServiceOrderDto with REQUESTED status
   * @param overrides - Optional overrides for the default values
   * @returns CreateServiceOrderDto instance
   */
  static createRequestedDto(overrides: Partial<CreateServiceOrderDto> = {}): CreateServiceOrderDto {
    return this.createCreateDto({
      notes: 'Service order requested by client',
      ...overrides,
    })
  }

  /**
   * Creates a CreateServiceOrderDto with specific vehicle ID
   * @param vehicleId - Vehicle ID
   * @param overrides - Optional overrides for the default values
   * @returns CreateServiceOrderDto instance
   */
  static createWithVehicle(
    vehicleId: string,
    overrides: Partial<CreateServiceOrderDto> = {},
  ): CreateServiceOrderDto {
    return this.createCreateDto({
      vehicleId,
      ...overrides,
    })
  }

  /**
   * Creates a ServiceOrderResponseDto with specific status
   * @param status - Service order status
   * @param overrides - Optional overrides for the default values
   * @returns ServiceOrderResponseDto instance
   */
  static createWithStatus(
    status: ServiceOrderStatus,
    overrides: Partial<ServiceOrderResponseDto> = {},
  ): ServiceOrderResponseDto {
    return this.createResponseDto({
      status,
      ...overrides,
    })
  }

  /**
   * Creates a ServiceOrderResponseDto with delivery date
   * @param deliveryDate - Delivery date
   * @param overrides - Optional overrides for the default values
   * @returns ServiceOrderResponseDto instance
   */
  static createWithDeliveryDate(
    deliveryDate: Date,
    overrides: Partial<ServiceOrderResponseDto> = {},
  ): ServiceOrderResponseDto {
    return this.createResponseDto({
      deliveryDate,
      ...overrides,
    })
  }

  /**
   * Creates a ServiceOrderResponseDto with cancellation reason
   * @param cancellationReason - Cancellation reason
   * @param overrides - Optional overrides for the default values
   * @returns ServiceOrderResponseDto instance
   */
  static createCancelled(
    cancellationReason: string,
    overrides: Partial<ServiceOrderResponseDto> = {},
  ): ServiceOrderResponseDto {
    return this.createResponseDto({
      status: ServiceOrderStatus.CANCELLED,
      cancellationReason,
      ...overrides,
    })
  }
}
