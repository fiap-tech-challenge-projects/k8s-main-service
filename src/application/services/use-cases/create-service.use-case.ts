import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateServiceDto, ServiceResponseDto } from '@application/services/dto'
import { ServiceMapper } from '@application/services/mappers'
import { ServiceNameAlreadyExistsException } from '@domain/services/exceptions'
import { IServiceRepository, SERVICE_REPOSITORY } from '@domain/services/interfaces'
import {
  ServiceNameValidator,
  ServiceDescriptionValidator,
  PriceValidator,
} from '@domain/services/validators'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new service
 * Handles the orchestration for service creation business process
 */
@Injectable()
export class CreateServiceUseCase {
  private readonly logger = new Logger(CreateServiceUseCase.name)

  /**
   * Constructor for CreateServiceUseCase
   * @param serviceRepository - Repository for service operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: IServiceRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute service creation
   * @param createServiceDto - Service creation data
   * @returns Result with service response DTO or domain exception
   */
  async execute(
    createServiceDto: CreateServiceDto,
  ): Promise<Result<ServiceResponseDto, ServiceNameAlreadyExistsException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing create service use case', {
        name: createServiceDto.name,
        price: createServiceDto.price,
        requestedBy: currentUserId,
        context: 'CreateServiceUseCase.execute',
      })

      // Validate service creation
      ServiceNameValidator.validate(createServiceDto.name)
      ServiceDescriptionValidator.validate(createServiceDto.description)

      if (!PriceValidator.isValid(createServiceDto.price)) {
        throw new Error('Invalid price format')
      }

      // Check if service name already exists
      const existingServices = await this.serviceRepository.findByName(createServiceDto.name)
      if (existingServices.data.length > 0) {
        throw new ServiceNameAlreadyExistsException(createServiceDto.name)
      }

      const service = ServiceMapper.fromCreateDto(createServiceDto)
      const savedService = await this.serviceRepository.create(service)
      const responseDto = ServiceMapper.toResponseDto(savedService)

      this.logger.log('Service creation use case completed successfully', {
        serviceId: responseDto.id,
        name: responseDto.name,
        requestedBy: currentUserId,
        context: 'CreateServiceUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error creating service', {
        name: createServiceDto.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CreateServiceUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException
          ? error
          : new ServiceNameAlreadyExistsException(createServiceDto.name),
      )
    }
  }
}
