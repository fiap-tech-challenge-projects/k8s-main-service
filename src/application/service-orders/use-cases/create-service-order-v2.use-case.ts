import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateServiceOrderDto, ServiceOrderResponseDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for creating a new service order (Version 2)
 * Orchestrates the creation process with proper business rules
 */
@Injectable()
export class CreateServiceOrderV2UseCase {
  private readonly logger = new Logger(CreateServiceOrderV2UseCase.name)

  /**
   * Constructor for CreateServiceOrderV2UseCase
   * @param serviceOrderRepository - Service order repository for data access
   * @param vehicleRepository - Repository for vehicle operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the create service order use case
   * @param dto - Create service order data
   * @returns Result with service order response
   */
  async execute(
    dto: CreateServiceOrderDto,
  ): Promise<Result<ServiceOrderResponseDto, DomainException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing create service order use case (V2)', {
        vehicleId: dto.vehicleId,
        notes: dto.notes ? 'Present' : 'Not provided',
        requestedBy: currentUserId,
        context: 'CreateServiceOrderV2UseCase.execute',
      })

      // Validate vehicle exists
      const vehicle = await this.vehicleRepository.findById(dto.vehicleId)
      if (!vehicle) {
        const error = new VehicleNotFoundException(dto.vehicleId)
        this.logger.warn('Vehicle not found for service order creation', {
          vehicleId: dto.vehicleId,
          requestedBy: currentUserId,
          context: 'CreateServiceOrderV2UseCase.execute',
        })
        return FAILURE(error)
      }

      // Create service order
      const serviceOrder = ServiceOrderMapper.fromCreateDto(dto, currentUserId ?? 'system')
      const savedServiceOrder = await this.serviceOrderRepository.create(serviceOrder)
      const responseDto = ServiceOrderMapper.toResponseDto(savedServiceOrder)

      this.logger.log('Service order creation use case (V2) completed successfully', {
        serviceOrderId: responseDto.id,
        status: responseDto.status,
        vehicleId: responseDto.vehicleId,
        requestedBy: currentUserId,
        context: 'CreateServiceOrderV2UseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = error instanceof Error ? error.constructor.name : 'Error'

      this.logger.error('Service order creation use case (V2) failed', {
        vehicleId: dto.vehicleId,
        error: errorMessage,
        errorType,
        context: 'CreateServiceOrderV2UseCase.execute',
      })

      if (error instanceof DomainException) {
        return FAILURE(error)
      }

      return FAILURE(
        new InvalidValueException('service_order_creation', 'Failed to create service order'),
      )
    }
  }
}
