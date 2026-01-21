import { VehicleEvaluation } from '@domain/vehicle-evaluations'
import { validateBaseMapper } from '@shared'

import {
  CreateVehicleEvaluationDto,
  VehicleEvaluationResponseDto,
  UpdateVehicleEvaluationDto,
} from '../dto'

/**
 * Mapper class for converting between vehicle evaluation domain entities and DTOs.
 *
 * This class provides static methods to transform vehicle evaluation data between
 * different layers of the application, including domain entities, DTOs,
 * and response objects.
 *
 * @example
 * // Map domain entity to response DTO
 * const responseDto = VehicleEvaluationMapper.toResponseDto(vehicleEvaluation);
 *
 * // Map create DTO to domain entity
 * const entity = VehicleEvaluationMapper.fromCreateDto(createDto);
 *
 * // Map update DTO to domain entity
 * const updatedEntity = VehicleEvaluationMapper.fromUpdateDto(updateDto, existingEntity);
 */
export class VehicleEvaluationMapper {
  /**
   * Maps a vehicle evaluation domain entity to a response DTO.
   *
   * This method transforms a domain entity into a response DTO that can be
   * safely returned to clients.
   *
   * @param entity - The vehicle evaluation domain entity to map
   * @returns A response DTO with all vehicle evaluation data
   *
   * @example
   * const responseDto = VehicleEvaluationMapper.toResponseDto(vehicleEvaluationEntity);
   */
  static toResponseDto(entity: VehicleEvaluation): VehicleEvaluationResponseDto {
    return {
      id: entity.id,
      details: entity.details,
      evaluationDate: entity.evaluationDate,
      mechanicNotes: entity.mechanicNotes,
      serviceOrderId: entity.serviceOrderId,
      vehicleId: entity.vehicleId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Maps an array of vehicle evaluation domain entities to an array of response DTOs.
   *
   * This method transforms an array of domain entities into response DTOs
   * that can be safely returned to clients.
   *
   * @param entities - Array of vehicle evaluation domain entities to map
   * @returns Array of response DTOs
   *
   * @example
   * const responseDtos = VehicleEvaluationMapper.toResponseDtoArray(vehicleEvaluationEntities);
   */
  static toResponseDtoArray(entities: VehicleEvaluation[]): VehicleEvaluationResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity))
  }

  /**
   * Maps a create DTO to a new vehicle evaluation domain entity.
   *
   * This method creates a new domain entity from a create DTO, setting
   * default values for fields that are managed by the database or
   * application logic.
   *
   * @param dto - The create DTO containing vehicle evaluation data
   * @returns A new vehicle evaluation domain entity
   *
   * @example
   * const entity = VehicleEvaluationMapper.fromCreateDto({
   *   serviceOrderId: 'so1234567890abcdef',
   *   vehicleId: 'v1234567890abcdef',
   *   details: { engineCondition: 'Good' },
   *   mechanicNotes: 'Vehicle in good condition'
   * });
   */
  static fromCreateDto(dto: CreateVehicleEvaluationDto): VehicleEvaluation {
    return new VehicleEvaluation(
      undefined as unknown as string,
      dto.serviceOrderId,
      dto.vehicleId,
      dto.details,
      new Date(),
      dto.mechanicNotes,
    )
  }

  /**
   * Maps an update DTO to an updated vehicle evaluation domain entity.
   *
   * This method creates an updated domain entity by merging the update DTO
   * with an existing entity, preserving unchanged values and updating
   * only the fields that are provided in the DTO.
   *
   * @param dto - The update DTO containing fields to update
   * @param existing - The existing vehicle evaluation domain entity
   * @returns An updated vehicle evaluation domain entity
   *
   * @example
   * const updatedEntity = VehicleEvaluationMapper.fromUpdateDto(
   *   { details: { engineCondition: 'Excellent' }, mechanicNotes: 'Updated notes' },
   *   existingVehicleEvaluation
   * );
   */
  static fromUpdateDto(
    dto: UpdateVehicleEvaluationDto,
    existing: VehicleEvaluation,
  ): VehicleEvaluation {
    if (dto.details !== undefined) {
      existing.updateDetails(dto.details)
    }

    if (dto.mechanicNotes !== undefined) {
      existing.updateMechanicNotes(dto.mechanicNotes)
    }

    return existing
  }
}

validateBaseMapper<
  VehicleEvaluation,
  VehicleEvaluationResponseDto,
  CreateVehicleEvaluationDto,
  UpdateVehicleEvaluationDto
>(VehicleEvaluationMapper, 'VehicleEvaluationMapper')
