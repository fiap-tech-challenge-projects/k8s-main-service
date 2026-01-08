import { User as PrismaUser, Prisma } from '@prisma/client'

import { User } from '@domain/auth/entities'
import { validateBasePrismaMapper } from '@shared/bases'
import { Email } from '@shared/value-objects'

/**
 * Mapper for User entity and Prisma User model
 */
export class UserMapper {
  /**
   * Convert Prisma User to domain User entity
   * @param prismaUser - Prisma User model
   * @returns User domain entity
   */
  static toDomain(prismaUser: PrismaUser): User {
    if (!prismaUser) {
      throw new Error('Prisma User cannot be null or undefined')
    }

    return new User(
      prismaUser.id,
      Email.create(prismaUser.email),
      prismaUser.password,
      prismaUser.role,
      prismaUser.isActive,
      prismaUser.lastLoginAt,
      prismaUser.clientId,
      prismaUser.employeeId,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    )
  }

  /**
   * Convert array of Prisma Users to domain User entities
   * @param prismaUsers - Array of Prisma User models
   * @returns Array of User domain entities
   */
  static toDomainMany(prismaUsers: PrismaUser[]): User[] {
    if (!Array.isArray(prismaUsers)) {
      throw new Error('Prisma Users must be an array')
    }

    return prismaUsers.map((prismaUser) => UserMapper.toDomain(prismaUser))
  }

  /**
   * Convert domain User entity to Prisma User for creation
   * @param entity - User domain entity
   * @returns Prisma User create input
   */
  static toPrismaCreate(entity: User): Prisma.UserCreateInput {
    if (!entity) {
      throw new Error('User domain entity cannot be null or undefined')
    }

    const createInput: Prisma.UserCreateInput = {
      email: entity.email.value,
      password: entity.password,
      role: entity.role,
      isActive: entity.isActive,
      lastLoginAt: entity.lastLoginAt,
    }

    if (entity.clientId) {
      createInput.client = {
        connect: {
          id: entity.clientId,
        },
      }
    }

    if (entity.employeeId) {
      createInput.employee = {
        connect: {
          id: entity.employeeId,
        },
      }
    }

    return createInput
  }

  /**
   * Convert domain User entity to Prisma User for update
   * @param entity - User domain entity
   * @returns Prisma User update input
   */
  static toPrismaUpdate(entity: User): Prisma.UserUpdateInput {
    if (!entity) {
      throw new Error('User domain entity cannot be null or undefined')
    }

    const updateInput: Prisma.UserUpdateInput = {
      email: entity.email.value,
      password: entity.password,
      role: entity.role,
      isActive: entity.isActive,
      lastLoginAt: entity.lastLoginAt,
    }

    if (entity.clientId) {
      updateInput.client = {
        connect: {
          id: entity.clientId,
        },
      }
    }

    if (entity.employeeId) {
      updateInput.employee = {
        connect: {
          id: entity.employeeId,
        },
      }
    }

    return updateInput
  }
}

validateBasePrismaMapper<User, PrismaUser, Prisma.UserCreateInput, Prisma.UserUpdateInput>(
  UserMapper,
  'UserMapper',
)
