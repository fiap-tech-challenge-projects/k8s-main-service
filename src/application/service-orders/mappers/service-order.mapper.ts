import {
  CreateServiceOrderDto,
  ServiceOrderResponseDto,
  UpdateServiceOrderDto,
} from '@application/service-orders/dto'
import { ServiceOrder } from '@domain/service-orders/entities'
import { validateBaseMapper } from '@shared'

/**
 * Mapper class for converting between ServiceOrder domain entities and DTOs.
 */
export class ServiceOrderMapper {
  /**
   * Convert domain to response DTO
   * @param entity - Service order entity to convert
   * @returns Service order response DTO
   */
  static toResponseDto(entity: ServiceOrder): ServiceOrderResponseDto {
    return {
      id: entity.id,
      status: entity.status,
      requestDate: entity.requestDate,
      deliveryDate: entity.deliveryDate,
      cancellationReason: entity.cancellationReason,
      notes: entity.notes,
      clientId: entity.clientId,
      vehicleId: entity.vehicleId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Convert domain array to response DTO array
   * @param entities - Array of service order entities to convert
   * @returns Array of service order response DTOs
   */
  static toResponseDtoArray(entities: ServiceOrder[]): ServiceOrderResponseDto[] {
    return entities.map((e) => this.toResponseDto(e))
  }

  /**
   * Create domain from create DTO
   * @param dto - Create service order DTO
   * @param clientId - Client ID determined from the vehicle
   * @returns New service order entity
   */
  static fromCreateDto(dto: CreateServiceOrderDto, clientId: string): ServiceOrder {
    return ServiceOrder.create(clientId, dto.vehicleId, dto.notes)
  }

  /**
   * Create domain from create DTO for employees (creates with RECEIVED status)
   * @param dto - Create service order DTO
   * @param clientId - Client ID determined from the vehicle
   * @returns New service order entity with RECEIVED status
   */
  static fromCreateDtoForEmployee(dto: CreateServiceOrderDto, clientId: string): ServiceOrder {
    return ServiceOrder.createReceived(clientId, dto.vehicleId, dto.notes)
  }

  /**
   * Apply update DTO to existing domain entity
   * Note: Status transitions should be handled in the service layer with proper validation
   * @param entity - Existing service order entity
   * @param dto - Update DTO with partial fields
   * @returns Updated service order entity
   */
  static fromUpdateDto(entity: ServiceOrder, dto: UpdateServiceOrderDto): ServiceOrder {
    // Note: Status transitions are handled in the service layer
    if (dto.status !== undefined) {
      entity.updateStatus(dto.status)
    }
    if (dto.deliveryDate !== undefined) {
      entity.updateDeliveryDate(new Date(dto.deliveryDate))
    }
    if (dto.cancellationReason !== undefined) {
      entity.updateCancellationReason(dto.cancellationReason)
    }
    if (dto.notes !== undefined) {
      entity.updateNotes(dto.notes)
    }

    return entity
  }
}

// Validate that this mapper implements the required contract
validateBaseMapper<
  ServiceOrder,
  ServiceOrderResponseDto,
  CreateServiceOrderDto,
  UpdateServiceOrderDto
>(ServiceOrderMapper, 'ServiceOrderMapper')
