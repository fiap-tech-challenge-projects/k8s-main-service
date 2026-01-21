import { plainToClass } from 'class-transformer'

import {
  CreateClientDto,
  UpdateClientDto,
  ClientResponseDto,
  PaginatedClientsResponseDto,
} from '@application/clients/dto'

/**
 * Factory for creating Client DTOs for testing
 */
export class ClientDtoFactory {
  /**
   * Create a valid CreateClientDto
   * @param overrides - Optional properties to override defaults
   * @returns CreateClientDto
   */
  public static createCreateClientDto(overrides: Partial<CreateClientDto> = {}): CreateClientDto {
    const defaults: CreateClientDto = {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      cpfCnpj: '12345678909',
      phone: '11999999999',
      address: 'Rua das Flores, 123 - São Paulo, SP',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateClientDto, data)
  }

  /**
   * Create a minimal CreateClientDto with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns CreateClientDto
   */
  public static createMinimalCreateClientDto(
    overrides: Partial<CreateClientDto> = {},
  ): CreateClientDto {
    const defaults: CreateClientDto = {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      cpfCnpj: '11144477735',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateClientDto, data)
  }

  /**
   * Create a CreateClientDto with CNPJ
   * @param overrides - Optional properties to override defaults
   * @returns CreateClientDto
   */
  public static createCreateClientDtoWithCnpj(
    overrides: Partial<CreateClientDto> = {},
  ): CreateClientDto {
    const defaults: CreateClientDto = {
      name: 'Empresa XYZ LTDA',
      email: 'contato@empresaxyz.com.br',
      cpfCnpj: '11222333000181',
      phone: '1133334444',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateClientDto, data)
  }

  /**
   * Create a valid UpdateClientDto
   * @param overrides - Optional properties to override defaults
   * @returns UpdateClientDto
   */
  public static createUpdateClientDto(overrides: Partial<UpdateClientDto> = {}): UpdateClientDto {
    const defaults: UpdateClientDto = {
      name: 'João Silva Updated',
      email: 'joao.silva.updated@email.com',
      phone: '1188889999',
      address: 'Rua das Rosas, 456 - São Paulo, SP',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateClientDto, data)
  }

  /**
   * Create a partial UpdateClientDto with only some fields
   * @param overrides - Optional properties to override defaults
   * @returns UpdateClientDto
   */
  public static createPartialUpdateClientDto(
    overrides: Partial<UpdateClientDto> = {},
  ): UpdateClientDto {
    const defaults: UpdateClientDto = {
      name: 'Updated Name',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateClientDto, data)
  }

  /**
   * Create a valid ClientResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns ClientResponseDto
   */
  public static createClientResponseDto(
    overrides: Partial<ClientResponseDto> = {},
  ): ClientResponseDto {
    const defaults: ClientResponseDto = {
      id: `client-test-${Date.now()}`,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      cpfCnpj: '123.456.789-09',
      phone: '+55 11 99999 9999',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a minimal ClientResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns ClientResponseDto
   */
  public static createMinimalClientResponseDto(
    overrides: Partial<ClientResponseDto> = {},
  ): ClientResponseDto {
    const defaults: ClientResponseDto = {
      id: `client-test-${Date.now()}`,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      cpfCnpj: '111.444.777-35',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a PaginatedClientsResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns PaginatedClientsResponseDto
   */
  public static createPaginatedClientsResponseDto(
    overrides: Partial<{
      data: ClientResponseDto[]
      meta: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }> = {},
  ): PaginatedClientsResponseDto {
    const clientsData = overrides.data ?? [
      this.createClientResponseDto({ id: 'client-1', name: 'Client 1' }),
      this.createClientResponseDto({ id: 'client-2', name: 'Client 2' }),
      this.createClientResponseDto({ id: 'client-3', name: 'Client 3' }),
    ]

    const defaults = {
      data: clientsData,
      meta: {
        total: clientsData.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(clientsData.length / 10),
        hasNext: false,
        hasPrev: false,
      },
    }

    return {
      data: overrides.data ?? defaults.data,
      meta: overrides.meta ? { ...defaults.meta, ...overrides.meta } : defaults.meta,
    }
  }

  /**
   * Create an empty PaginatedClientsResponseDto
   * @returns PaginatedClientsResponseDto
   */
  public static createEmptyPaginatedClientsResponseDto(): PaginatedClientsResponseDto {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }

  /**
   * Create multiple CreateClientDto instances
   * @param count - Number of DTOs to create
   * @param baseOverrides - Base overrides to apply to all DTOs
   * @returns Array of CreateClientDto
   */
  public static createManyCreateClientDto(
    count: number,
    baseOverrides: Partial<CreateClientDto> = {},
  ): CreateClientDto[] {
    return Array.from({ length: count }, (_, index) =>
      this.createCreateClientDto({
        ...baseOverrides,
        name: `${baseOverrides.name ?? 'Cliente'} ${index + 1}`,
        email: `${baseOverrides.email ?? `cliente${index + 1}@email.com`}`,
        cpfCnpj: baseOverrides.cpfCnpj ?? `1234567890${(index + 1).toString().padStart(1, '0')}`,
      }),
    )
  }
}
