import { ServiceExecution } from '@domain/service-executions'
import { validateBaseMapper } from '@shared'

import {
  CreateServiceExecutionDto,
  ServiceExecutionResponseDto,
  UpdateServiceExecutionDto,
} from '../dto'

/**
 * Mapper class for converting between service execution domain entities and DTOs.
 *
 * This class provides static methods to transform service execution data between
 * different layers of the application, including domain entities, DTOs,
 * and response objects.
 *
 * @example
 * // Map domain entity to response DTO
 * const responseDto = ServiceExecutionMapper.toResponseDto(serviceExecution);
 *
 * // Map create DTO to domain entity
 * const entity = ServiceExecutionMapper.fromCreateDto(createDto);
 *
 * // Map update DTO to domain entity
 * const updatedEntity = ServiceExecutionMapper.fromUpdateDto(updateDto, existingEntity);
 */
export class ServiceExecutionMapper {
  /**
   * Maps a service execution domain entity to a response DTO.
   *
   * This method transforms a domain entity into a response DTO that can be
   * safely returned to clients, including calculated values like duration.
   *
   * @param entity - The service execution domain entity to map
   * @returns A response DTO with all service execution data
   *
   * @example
   * const responseDto = ServiceExecutionMapper.toResponseDto(serviceExecutionEntity);
   */
  static toResponseDto(entity: ServiceExecution): ServiceExecutionResponseDto {
    return {
      id: entity.id,
      status: entity.status,
      startTime: entity.startTime,
      endTime: entity.endTime,
      notes: entity.notes,
      serviceOrderId: entity.serviceOrderId,
      mechanicId: entity.mechanicId,
      durationInMinutes: entity.getDurationInMinutes() ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Maps an array of service execution domain entities to an array of response DTOs.
   *
   * This method transforms an array of domain entities into response DTOs
   * that can be safely returned to clients.
   *
   * @param entities - Array of service execution domain entities to map
   * @returns Array of response DTOs
   *
   * @example
   * const responseDtos = ServiceExecutionMapper.toResponseDtoArray(serviceExecutionEntities);
   */
  static toResponseDtoArray(entities: ServiceExecution[]): ServiceExecutionResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity))
  }

  /**
   * Maps a create DTO to a new service execution domain entity.
   *
   * This method creates a new domain entity from a create DTO, setting
   * default values for fields that are managed by the database or
   * application logic.
   *
   * @param dto - The create DTO containing service execution data
   * @returns A new service execution domain entity
   *
   * @example
   * const entity = ServiceExecutionMapper.fromCreateDto({
   *   serviceOrderId: 'so1234567890abcdef',
   *   mechanicId: 'emp1234567890abcdef',
   *   notes: 'Oil change completed'
   * });
   */
  static fromCreateDto(dto: CreateServiceExecutionDto): ServiceExecution {
    return ServiceExecution.create(dto.serviceOrderId, dto.mechanicId, dto.notes)
  }

  /**
   * Apply update DTO to existing domain entity
   * @param entity - Existing service order entity
   * @param dto - Update DTO with partial fields
   * @returns Updated service order entity
   */
  static fromUpdateDto(entity: ServiceExecution, dto: UpdateServiceExecutionDto): ServiceExecution {
    let updatedEntity: ServiceExecution = entity

    if (dto.mechanicId !== undefined) {
      updatedEntity = updatedEntity.updateAssignedMechanic(dto.mechanicId)
    }
    if (dto.notes !== undefined) {
      updatedEntity = updatedEntity.updateNotes(dto.notes)
    }

    return updatedEntity
  }
}

// Validate that this mapper implements the required contract
validateBaseMapper<
  ServiceExecution,
  ServiceExecutionResponseDto,
  CreateServiceExecutionDto,
  UpdateServiceExecutionDto
>(ServiceExecutionMapper, 'ServiceExecutionMapper')
