import { Injectable } from '@nestjs/common'
import { Client as PrismaClient } from '@prisma/client'

import { Client } from '@domain/clients/entities'
import { IClientRepository } from '@domain/clients/interfaces'
import { CpfCnpj } from '@domain/clients/value-objects'
import { BasePrismaRepository } from '@infra/database/common'
import { ClientMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'
import { Email } from '@shared/value-objects'

/**
 * Prisma implementation of the Client repository
 */
@Injectable()
export class PrismaClientRepository
  extends BasePrismaRepository<Client, PrismaClient>
  implements IClientRepository
{
  /**
   * Constructor for PrismaClientRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaClientRepository.name)
  }

  protected get modelName(): string {
    return 'client'
  }

  protected get mapper(): (prismaModel: PrismaClient) => Client {
    return ClientMapper.toDomain
  }

  protected get createMapper(): (entity: Client) => Record<string, unknown> {
    return ClientMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: Client) => Record<string, unknown> {
    return ClientMapper.toPrismaUpdate
  }

  /**
   * Find client by CPF or CNPJ
   * @param cpfCnpj - The CPF or CNPJ to search for
   * @returns Promise resolving to the client or null if not found
   */
  async findByCpfCnpj(cpfCnpj: string): Promise<Client | null> {
    try {
      const cpfCnpjValueObject = new CpfCnpj(cpfCnpj)
      const cleanCpfCnpj = cpfCnpjValueObject.clean
      return this.findByUniqueField('cpfCnpj', cleanCpfCnpj)
    } catch (error) {
      this.logger.error(`Error finding client by CPF/CNPJ ${cpfCnpj}:`, error)
      throw error
    }
  }

  /**
   * Find client by email
   * @param email - The email to search for
   * @returns Promise resolving to the client or null if not found
   */
  async findByEmail(email: string): Promise<Client | null> {
    try {
      const normalizedEmail = new Email(email).normalized
      return this.findByUniqueField('email', normalizedEmail)
    } catch (error) {
      this.logger.error(`Error finding client by email ${email}:`, error)
      throw error
    }
  }

  /**
   * Check if a CPF or CNPJ is already registered
   * @param cpfCnpj - The CPF or CNPJ to check
   * @returns Promise resolving to true if CPF/CNPJ exists, false otherwise
   */
  async cpfCnpjExists(cpfCnpj: string): Promise<boolean> {
    try {
      const cpfCnpjValueObject = new CpfCnpj(cpfCnpj)
      const cleanCpfCnpj = cpfCnpjValueObject.clean
      return this.uniqueFieldExists('cpfCnpj', cleanCpfCnpj)
    } catch (error) {
      this.logger.error(`Error checking if CPF/CNPJ exists ${cpfCnpj}:`, error)
      throw error
    }
  }

  /**
   * Check if an email is already registered
   * @param email - The email to check
   * @returns Promise resolving to true if email exists, false otherwise
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const normalizedEmail = new Email(email).normalized
      return this.uniqueFieldExists('email', normalizedEmail)
    } catch (error) {
      this.logger.error(`Error checking if email exists ${email}:`, error)
      throw error
    }
  }

  /**
   * Find clients by name (partial match)
   * @param name - The name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByName(name: string, page?: number, limit?: number): Promise<PaginatedResult<Client>> {
    // TODO: Implement accent-insensitive search using PostgreSQL's UNACCENT function
    // Reference: https://stackoverflow.com/questions/11005036/does-postgresql-support-accent-insensitive-collations
    return this.findPaginated(
      {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      page,
      limit,
      { name: 'asc' },
    )
  }
}
