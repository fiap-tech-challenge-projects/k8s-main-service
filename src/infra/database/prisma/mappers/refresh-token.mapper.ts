import { RefreshToken as PrismaRefreshToken, Prisma } from '@prisma/client'

import { RefreshToken } from '@domain/auth/entities'
import { validateBasePrismaMapper } from '@shared/bases'

/**
 * Mapper for RefreshToken entity and Prisma RefreshToken model
 */
export class RefreshTokenMapper {
  /**
   * Convert Prisma RefreshToken to domain RefreshToken entity
   * @param prismaRefreshToken - Prisma RefreshToken model
   * @returns RefreshToken domain entity
   */
  static toDomain(prismaRefreshToken: PrismaRefreshToken): RefreshToken {
    if (!prismaRefreshToken) {
      throw new Error('Prisma RefreshToken cannot be null or undefined')
    }

    return new RefreshToken(
      prismaRefreshToken.id,
      prismaRefreshToken.token,
      prismaRefreshToken.userId,
      prismaRefreshToken.expiresAt,
      prismaRefreshToken.createdAt,
    )
  }

  /**
   * Convert array of Prisma RefreshTokens to domain RefreshToken entities
   * @param prismaRefreshTokens - Array of Prisma RefreshToken models
   * @returns Array of RefreshToken domain entities
   */
  static toDomainMany(prismaRefreshTokens: PrismaRefreshToken[]): RefreshToken[] {
    if (!Array.isArray(prismaRefreshTokens)) {
      throw new Error('Prisma RefreshTokens must be an array')
    }

    return prismaRefreshTokens.map((prismaRefreshToken) =>
      RefreshTokenMapper.toDomain(prismaRefreshToken),
    )
  }

  /**
   * Convert domain RefreshToken entity to Prisma RefreshToken for creation
   * @param entity - RefreshToken domain entity
   * @returns Prisma RefreshToken create input
   */
  static toPrismaCreate(entity: RefreshToken): Prisma.RefreshTokenCreateInput {
    if (!entity) {
      throw new Error('RefreshToken domain entity cannot be null or undefined')
    }

    return {
      token: entity.token,
      user: {
        connect: {
          id: entity.userId,
        },
      },
      expiresAt: entity.expiresAt,
    }
  }

  /**
   * Convert domain RefreshToken entity to Prisma RefreshToken for update
   * @param entity - RefreshToken domain entity
   * @returns Prisma RefreshToken update input
   */
  static toPrismaUpdate(entity: RefreshToken): Prisma.RefreshTokenUpdateInput {
    if (!entity) {
      throw new Error('RefreshToken domain entity cannot be null or undefined')
    }

    return {
      token: entity.token,
      user: {
        connect: {
          id: entity.userId,
        },
      },
      expiresAt: entity.expiresAt,
    }
  }
}

validateBasePrismaMapper<
  RefreshToken,
  PrismaRefreshToken,
  Prisma.RefreshTokenCreateInput,
  Prisma.RefreshTokenUpdateInput
>(RefreshTokenMapper, 'RefreshTokenMapper')
