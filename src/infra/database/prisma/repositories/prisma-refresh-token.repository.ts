import { Injectable } from '@nestjs/common'
import { RefreshToken as PrismaRefreshToken } from '@prisma/client'

import { RefreshToken } from '@domain/auth/entities'
import { IRefreshTokenRepository } from '@domain/auth/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { RefreshTokenMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'

/**
 * Prisma implementation of the refresh token repository
 */
@Injectable()
export class PrismaRefreshTokenRepository
  extends BasePrismaRepository<RefreshToken, PrismaRefreshToken>
  implements IRefreshTokenRepository
{
  /**
   * Constructor for PrismaRefreshTokenRepository
   * @param prisma - Prisma service for database operations
   */
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, PrismaRefreshTokenRepository.name)
  }

  protected get modelName(): string {
    return 'refreshToken'
  }

  protected get mapper(): (prismaModel: PrismaRefreshToken) => RefreshToken {
    return RefreshTokenMapper.toDomain
  }

  protected get createMapper(): (entity: RefreshToken) => Record<string, unknown> {
    return RefreshTokenMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: RefreshToken) => Record<string, unknown> {
    return RefreshTokenMapper.toPrismaUpdate
  }

  /**
   * Find refresh token by token string
   * @param token - Refresh token string
   * @returns RefreshToken entity or null if not found
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { token },
      })

      return refreshToken ? RefreshTokenMapper.toDomain(refreshToken) : null
    } catch (error) {
      this.logger.error(`Error finding refresh token by token:`, error)
      throw error
    }
  }

  /**
   * Find all refresh tokens for a user
   * @param userId - User ID
   * @returns Array of refresh tokens
   */
  async findByUserId(userId: string): Promise<RefreshToken[]> {
    try {
      const refreshTokens = await this.prisma.refreshToken.findMany({
        where: { userId },
      })

      return refreshTokens.map(RefreshTokenMapper.toDomain)
    } catch (error) {
      this.logger.error(`Error finding refresh tokens by user ID ${userId}:`, error)
      throw error
    }
  }

  /**
   * Delete all refresh tokens for a user
   * @param userId - User ID
   */
  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      })
    } catch (error) {
      this.logger.error(`Error deleting refresh tokens by user ID ${userId}:`, error)
      throw error
    }
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpired(): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
    } catch (error) {
      this.logger.error('Error deleting expired refresh tokens:', error)
      throw error
    }
  }
}
