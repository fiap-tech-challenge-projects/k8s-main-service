import { ClientResponseDto, CreateClientDto, UpdateClientDto } from '@application/clients/dto'
import { Client } from '@domain/clients/entities'
import { validateBaseMapper } from '@shared'
import { PhoneFormatter } from '@shared/utils'

/**
 * Mapper class for converting between client domain entities and DTOs.
 * Implements the BaseMapper contract with static methods.
 */
export class ClientMapper {
  /**
   * Maps a Client entity to a ClientResponseDto.
   * @param entity - Client domain entity
   * @returns Mapped ClientResponseDto
   */
  static toResponseDto(entity: Client): ClientResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.getNormalizedEmail(),
      cpfCnpj: entity.getFormattedCpfCnpj(),
      phone: PhoneFormatter.format(entity.phone),
      address: entity.address,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Maps an array of Client entities to an array of ClientResponseDto.
   * @param entities - Array of Client domain entities
   * @returns Array of mapped ClientResponseDto
   */
  static toResponseDtoArray(entities: Client[]): ClientResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity))
  }

  /**
   * Maps a CreateClientDto to a Client entity.
   * @param dto - DTO for creating a new client
   * @returns Mapped Client entity
   */
  static fromCreateDto(dto: CreateClientDto): Client {
    return Client.create(dto.name, dto.email, dto.cpfCnpj, dto.phone, dto.address)
  }

  /**
   * Maps an UpdateClientDto to an updated Client entity.
   * @param dto - DTO for updating an existing client
   * @param existing - Existing Client entity to be updated
   * @returns The same Client entity with updated properties
   */
  static fromUpdateDto(dto: UpdateClientDto, existing: Client): Client {
    if (dto.name !== undefined && dto.name !== existing.name) {
      existing.updateName(dto.name)
    }

    if (dto.email !== undefined && dto.email !== existing.getNormalizedEmail()) {
      existing.updateEmail(dto.email)
    }

    if (dto.phone !== undefined && dto.phone !== existing.phone) {
      existing.updatePhone(dto.phone)
    }

    if (dto.address !== undefined && dto.address !== existing.address) {
      existing.updateAddress(dto.address)
    }

    return existing
  }
}

// Validate that this mapper implements the BaseMapper contract
validateBaseMapper(ClientMapper, 'ClientMapper')
