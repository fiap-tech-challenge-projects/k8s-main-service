import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto } from '@application/services/dto'
import { Service } from '@domain/services/entities'
import { validateBaseMapper } from '@shared'

/**
 * Mapper class for converting between service domain entities and DTOs.
 * Implements the BaseMapper contract with static methods.
 */
export class ServiceMapper {
  /**
   * Maps a Service entity to a ServiceResponseDto.
   * @param entity - Service domain entity
   * @returns Mapped ServiceResponseDto
   */
  static toResponseDto(entity: Service): ServiceResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      price: entity.getFormattedPrice(),
      description: entity.description,
      estimatedDuration: entity.getFormattedDuration(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Maps an array of Service entities to an array of ServiceResponseDto.
   * @param entities - Array of Service domain entities
   * @returns Array of mapped ServiceResponseDto
   */
  static toResponseDtoArray(entities: Service[]): ServiceResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity))
  }

  /**
   * Maps a CreateServiceDto to a Service entity.
   * @param dto - DTO for creating a new service
   * @returns Mapped Service entity
   */
  static fromCreateDto(dto: CreateServiceDto): Service {
    return Service.create(dto.name, dto.price, dto.description, dto.estimatedDuration ?? '00:00:00')
  }

  /**
   * Maps an UpdateServiceDto to an updated Service entity.
   * @param dto - DTO for updating an existing service
   * @param existing - Existing Service entity to be updated
   * @returns The same Service entity with updated properties
   */
  static fromUpdateDto(dto: UpdateServiceDto, existing: Service): Service {
    if (dto.name !== undefined && dto.name !== existing.name) {
      existing.updateName(dto.name)
    }

    if (dto.description !== undefined && dto.description !== existing.description) {
      existing.updateDescription(dto.description)
    }

    if (dto.price !== undefined && dto.price !== existing.getFormattedPrice()) {
      existing.updatePrice(dto.price)
    }

    if (
      dto.estimatedDuration !== undefined &&
      dto.estimatedDuration !== existing.getFormattedDuration()
    ) {
      existing.updateEstimatedDuration(dto.estimatedDuration)
    }

    return existing
  }
}

// Validate that this mapper implements the required contract
validateBaseMapper<Service, ServiceResponseDto, CreateServiceDto, UpdateServiceDto>(
  ServiceMapper,
  'ServiceMapper',
)
