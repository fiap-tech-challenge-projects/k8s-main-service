import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateServiceDto, ServiceResponseDto } from '@application/services/dto'
import { ServiceMapper } from '@application/services/mappers'
import { ServiceNotFoundException } from '@domain/services/exceptions'
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
 * Use case for updating a service
 * Orchestrates the business logic for updating an existing service
 */
@Injectable()
export class UpdateServiceUseCase {
  private readonly logger = new Logger(UpdateServiceUseCase.name)

  /**
   * Constructor for UpdateServiceUseCase
   * @param serviceRepository - Repository for service operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: IServiceRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the update service use case
   * @param id - Service ID
   * @param updateServiceDto - Service data to update
   * @returns Promise resolving to Result with updated service response
   */
  async execute(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Result<ServiceResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing update service use case', {
        serviceId: id,
        name: updateServiceDto.name,
        requestedBy: currentUserId,
        context: 'UpdateServiceUseCase.execute',
      })

      // Check if service exists
      const existingService = await this.serviceRepository.findById(id)
      if (!existingService) {
        const error = new ServiceNotFoundException(id)
        this.logger.warn('Service not found for update', {
          serviceId: id,
          requestedBy: currentUserId,
          context: 'UpdateServiceUseCase.execute',
        })
        return new Failure(error)
      }

      // Validate update data
      if (updateServiceDto.name) {
        ServiceNameValidator.validate(updateServiceDto.name)
      }
      if (updateServiceDto.description) {
        ServiceDescriptionValidator.validate(updateServiceDto.description)
      }
      if (updateServiceDto.price !== undefined && !PriceValidator.isValid(updateServiceDto.price)) {
        throw new Error('Invalid price format')
      }

      const updatedService = ServiceMapper.fromUpdateDto(updateServiceDto, existingService)
      const savedService = await this.serviceRepository.update(id, updatedService)
      const responseDto = ServiceMapper.toResponseDto(savedService)

      this.logger.log('Service update use case completed successfully', {
        serviceId: id,
        name: responseDto.name,
        requestedBy: currentUserId,
        context: 'UpdateServiceUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error updating service', {
        serviceId: id,
        name: updateServiceDto.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateServiceUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new ServiceNotFoundException(id),
      )
    }
  }
}
