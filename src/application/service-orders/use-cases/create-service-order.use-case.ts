import { Injectable, Inject, Logger } from '@nestjs/common'

import { CreateServiceOrderDto, ServiceOrderResponseDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
// import { ServiceOrderReceivedEvent } from '@domain/service-orders/events'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Vehicle } from '@domain/vehicles/entities'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { EventBus, EVENT_BUS } from '@shared/events'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new service order
 * Orchestrates the creation process with proper business rules
 */
@Injectable()
export class CreateServiceOrderUseCase {
  private readonly logger = new Logger(CreateServiceOrderUseCase.name)

  /**
   * Constructor for CreateServiceOrderUseCase
   * @param serviceOrderRepository - Repository for service orders
   * @param vehicleRepository - Repository for vehicle operations
   * @param eventBus - Event bus for publishing domain events
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the create service order use case
   * @param dto - Create service order data
   * @returns Result with service order response or domain exception
   */
  async execute(
    dto: CreateServiceOrderDto,
  ): Promise<Result<ServiceOrderResponseDto, DomainException>> {
    const userId = this.userContextService.getUserId()
    const userRole = this.userContextService.getUserRole()
    let vehicle: Vehicle | null = null

    try {
      this.logger.log('Creating service order', {
        vehicleId: dto.vehicleId,
        userId,
        userRole,
        context: 'CreateServiceOrderUseCase.execute',
      })

      // import { ServiceOrderReceivedEvent } from '@domain/service-orders/events'
      vehicle = await this.vehicleRepository.findById(dto.vehicleId)

      if (!vehicle) {
        const error = new VehicleNotFoundException(dto.vehicleId)
        this.logger.warn('Vehicle not found for service order creation', {
          vehicleId: dto.vehicleId,
          userId,
          userRole,
          context: 'CreateServiceOrderUseCase.execute',
        })
        return new Failure(error)
      }

      const serviceOrder = ServiceOrderMapper.fromCreateDtoForEmployee(dto, vehicle.clientId)

      console.log('========== CREATESERVICEORDERUSECASE SUCCESS STEP 1 ==========')
      console.log('ServiceOrder entity created from mapper successfully')
      console.log('Service order data:', {
        status: serviceOrder.status,
        clientId: serviceOrder.clientId,
        vehicleId: serviceOrder.vehicleId,
        notes: serviceOrder.notes,
      })
      console.log('About to call repository.create...')
      console.log('========== END SUCCESS STEP 1 ==========')

      const savedServiceOrder = await this.serviceOrderRepository.create(serviceOrder)

      console.log('========== CREATESERVICEORDERUSECASE SUCCESS STEP 2 ==========')
      console.log('Repository.create completed successfully')
      console.log('Saved service order ID:', savedServiceOrder.id)
      console.log('========== END SUCCESS STEP 2 ==========')

      // Temporarily commenting out event publishing to debug
      // await this.eventBus.publish(
      //   new ServiceOrderReceivedEvent(savedServiceOrder.id, {
      //     clientId: savedServiceOrder.clientId,
      //     vehicleId: savedServiceOrder.vehicleId,
      //     receivedAt: savedServiceOrder.requestDate,
      //   }),
      // )

      this.logger.log('Service order created successfully', {
        serviceOrderId: savedServiceOrder.id,
        status: savedServiceOrder.status,
        userId,
        userRole,
        context: 'CreateServiceOrderUseCase.execute',
      })

      const responseDto = ServiceOrderMapper.toResponseDto(savedServiceOrder)
      return new Success(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const errorStack = error instanceof Error ? error.stack : undefined

      // Force console logging to debug since regular logger might be suppressed
      console.error('========== CREATESERVICEORDERUSECASE ERROR DEBUG ==========')
      console.error('Error message:', errorMessage)
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('DTO:', dto)
      console.error('User ID:', userId)
      console.error('User Role:', userRole)
      console.error('Vehicle exists:', !!vehicle)
      console.error('Error stack:', errorStack)
      console.error('Original error object:', error)
      console.error('========== END DEBUG ==========')

      this.logger.error('Failed to create service order - DETAILED ERROR', {
        error: errorMessage,
        stack: errorStack,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        dto,
        userId,
        userRole,
        vehicleExists: !!vehicle,
        context: 'CreateServiceOrderUseCase.execute',
      })

      if (error instanceof DomainException) {
        return new Failure(error)
      }

      return new Failure(
        new InvalidValueException('service_order_creation', 'Failed to create service order'),
      )
    }
  }
}
