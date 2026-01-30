import { Client } from '@domain/clients/entities'
import { CpfCnpj } from '@domain/clients/value-objects'
import { Email } from '@shared'

/**
 * Factory for creating Client entities for testing
 */
export class ClientFactory {
  /**
   * Create a valid Client entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns Client entity
   */
  public static create(
    overrides: Partial<{
      id: string
      name: string
      email: string
      cpfCnpj: string
      phone?: string
      address?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Client {
    const defaults = {
      id: `client-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      cpfCnpj: '12345678909',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Client(
      data.id,
      data.name,
      Email.create(data.email),
      CpfCnpj.create(data.cpfCnpj),
      data.phone,
      data.address,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a minimal Client entity with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns Client entity
   */
  public static createMinimal(
    overrides: Partial<{
      id: string
      name: string
      email: string
      cpfCnpj: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Client {
    const defaults = {
      id: `client-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      cpfCnpj: '11144477735',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Client(
      data.id,
      data.name,
      Email.create(data.email),
      CpfCnpj.create(data.cpfCnpj),
      undefined,
      undefined,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a Client entity with CNPJ
   * @param overrides - Optional properties to override defaults
   * @returns Client entity
   */
  public static createWithCnpj(
    overrides: Partial<{
      id: string
      name: string
      email: string
      cpfCnpj: string
      phone?: string
      address?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Client {
    const defaults = {
      id: `client-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Empresa XYZ LTDA',
      email: 'contato@empresaxyz.com.br',
      cpfCnpj: '11222333000181',
      phone: '(11) 3333-4444',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Client(
      data.id,
      data.name,
      Email.create(data.email),
      CpfCnpj.create(data.cpfCnpj),
      data.phone,
      data.address,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create an array of Client entities
   * @param count - Number of clients to create
   * @param baseOverrides - Base overrides to apply to all clients
   * @returns Array of Client entities
   */
  public static createMany(
    count: number,
    baseOverrides: Partial<{
      name: string
      email: string
      cpfCnpj: string
      phone?: string
      address?: string
    }> = {},
  ): Client[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...baseOverrides,
        id: `client-test-${index}-${Date.now()}`,
        name: `${baseOverrides.name ?? 'Cliente'} ${index + 1}`,
        email: `${baseOverrides.email ?? `cliente${index + 1}@email.com`}`,
        cpfCnpj: baseOverrides.cpfCnpj ?? '12345678909',
      }),
    )
  }
}
