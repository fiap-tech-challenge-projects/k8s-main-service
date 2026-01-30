import { Client as PrismaClient, Prisma } from '@prisma/client'

import { Client } from '@domain/clients/entities'
import { CpfCnpj } from '@domain/clients/value-objects'
import { Email } from '@shared'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaClientCreateInput = Prisma.ClientUncheckedCreateInput
type PrismaClientUpdateInput = Prisma.ClientUncheckedUpdateInput

/**
 * Mapper for converting between Prisma Client models and Client domain entities
 */
export class ClientMapper {
  /**
   * Converts a Prisma Client model to a Client domain entity
   * @param prismaClient - The Prisma Client model from the database
   * @returns Client domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaClient: PrismaClient): Client {
    if (!prismaClient) {
      throw new Error('Prisma Client model cannot be null or undefined')
    }

    const email = Email.create(prismaClient.email)
    const cpfCnpj = CpfCnpj.create(prismaClient.cpfCnpj)

    return new Client(
      prismaClient.id,
      prismaClient.name,
      email,
      cpfCnpj,
      prismaClient.phone ?? undefined,
      prismaClient.address ?? undefined,
      prismaClient.createdAt,
      prismaClient.updatedAt,
    )
  }

  /**
   * Converts multiple Prisma Client models to Client domain entities
   * @param prismaClients - Array of Prisma Client models
   * @returns Array of Client domain entities
   */
  static toDomainMany(prismaClients: PrismaClient[]): Client[] {
    if (!Array.isArray(prismaClients)) {
      return []
    }

    return prismaClients
      .filter((client) => client !== null && client !== undefined)
      .map((client) => this.toDomain(client))
  }

  /**
   * Converts a Client domain entity to Prisma create data
   * @param client - The Client domain entity to convert
   * @returns Prisma create input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(client: Client): PrismaClientCreateInput {
    if (!client) {
      throw new Error('Client domain entity cannot be null or undefined')
    }

    return {
      name: client.name,
      email: client.email.normalized,
      cpfCnpj: client.cpfCnpj.clean,
      phone: client.phone ?? null,
      address: client.address ?? null,
    }
  }

  /**
   * Converts a Client domain entity to Prisma update data
   * @param client - The Client domain entity to convert
   * @returns Prisma update input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(client: Client): PrismaClientUpdateInput {
    if (!client) {
      throw new Error('Client domain entity cannot be null or undefined')
    }

    return {
      name: client.name,
      email: client.email.normalized,
      cpfCnpj: client.cpfCnpj.clean,
      phone: client.phone ?? null,
      address: client.address ?? null,
      updatedAt: new Date(),
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<Client, PrismaClient, PrismaClientCreateInput, PrismaClientUpdateInput>(
  ClientMapper,
  'ClientMapper',
)
