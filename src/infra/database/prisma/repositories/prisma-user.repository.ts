import { Injectable } from '@nestjs/common'
import { User as PrismaUser } from '@prisma/client'

import { User } from '@domain/auth/entities'
import { IUserRepository } from '@domain/auth/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { UserMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'

/**
 * Prisma implementation of the user repository
 */
@Injectable()
export class PrismaUserRepository
  extends BasePrismaRepository<User, PrismaUser>
  implements IUserRepository
{
  /**
   * Constructor for PrismaUserRepository
   * @param prisma - Prisma service for database operations
   */
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, PrismaUserRepository.name)
  }

  protected get modelName(): string {
    return 'user'
  }

  protected get mapper(): (prismaModel: PrismaUser) => User {
    return UserMapper.toDomain
  }

  protected get createMapper(): (entity: User) => Record<string, unknown> {
    return UserMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: User) => Record<string, unknown> {
    return UserMapper.toPrismaUpdate
  }

  /**
   * Find user by email
   * @param email - User's email address
   * @returns User entity or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      })

      return user ? UserMapper.toDomain(user) : null
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error)
      throw error
    }
  }

  /**
   * Find user by client ID
   * @param clientId - Client ID
   * @returns User entity or null if not found
   */
  async findByClientId(clientId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clientId },
      })

      return user ? UserMapper.toDomain(user) : null
    } catch (error) {
      this.logger.error(`Error finding user by client ID ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Find user by employee ID
   * @param employeeId - Employee ID
   * @returns User entity or null if not found
   */
  async findByEmployeeId(employeeId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { employeeId },
      })

      return user ? UserMapper.toDomain(user) : null
    } catch (error) {
      this.logger.error(`Error finding user by employee ID ${employeeId}:`, error)
      throw error
    }
  }

  /**
   * Check if email exists
   * @param email - Email to check
   * @returns True if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email },
      })

      return count > 0
    } catch (error) {
      this.logger.error(`Error checking if email exists ${email}:`, error)
      throw error
    }
  }
}
