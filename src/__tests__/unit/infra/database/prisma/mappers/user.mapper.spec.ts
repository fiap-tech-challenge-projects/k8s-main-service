import { User as PrismaUser, UserRole } from '@prisma/client'

import { User } from '@domain/auth/entities'
import { UserMapper } from '@infra/database/prisma/mappers'

describe('UserMapper', () => {
  const mockPrismaUser: PrismaUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    role: UserRole.CLIENT,
    isActive: true,
    lastLoginAt: new Date('2024-01-01T10:00:00Z'),
    clientId: 'client-123',
    employeeId: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  }

  const mockUser = User.create('test@example.com', 'hashed-password', UserRole.CLIENT, 'client-123')

  describe('toDomain', () => {
    it('should convert Prisma user to domain user', () => {
      const result = UserMapper.toDomain(mockPrismaUser)

      expect(result).toBeInstanceOf(User)
      expect(result.id).toBe(mockPrismaUser.id)
      expect(result.email.value).toBe(mockPrismaUser.email)
      expect(result.password).toBe(mockPrismaUser.password)
      expect(result.role).toBe(mockPrismaUser.role)
      expect(result.isActive).toBe(mockPrismaUser.isActive)
      expect(result.lastLoginAt).toEqual(mockPrismaUser.lastLoginAt)
      expect(result.clientId).toBe(mockPrismaUser.clientId)
      expect(result.employeeId).toBe(mockPrismaUser.employeeId)
      expect(result.createdAt).toEqual(mockPrismaUser.createdAt)
      expect(result.updatedAt).toEqual(mockPrismaUser.updatedAt)
    })

    it('should handle user with employee role', () => {
      const employeeUser: PrismaUser = {
        ...mockPrismaUser,
        role: UserRole.EMPLOYEE,
        clientId: null,
        employeeId: 'employee-123',
      }

      const result = UserMapper.toDomain(employeeUser)

      expect(result.role).toBe(UserRole.EMPLOYEE)
      expect(result.clientId).toBeNull()
      expect(result.employeeId).toBe('employee-123')
    })

    it('should handle user with admin role', () => {
      const adminUser: PrismaUser = {
        ...mockPrismaUser,
        role: UserRole.ADMIN,
        clientId: null,
        employeeId: null,
      }

      const result = UserMapper.toDomain(adminUser)

      expect(result.role).toBe(UserRole.ADMIN)
      expect(result.clientId).toBeNull()
      expect(result.employeeId).toBeNull()
    })

    it('should handle email normalization', () => {
      const userWithUpperCaseEmail: PrismaUser = {
        ...mockPrismaUser,
        email: 'TEST@EXAMPLE.COM',
      }

      const result = UserMapper.toDomain(userWithUpperCaseEmail)

      expect(result.getNormalizedEmail()).toBe('test@example.com')
      expect(result.getEmailDomain()).toBe('EXAMPLE.COM')
      expect(result.getEmailLocalPart()).toBe('TEST')
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert domain user to Prisma create input', () => {
      const result = UserMapper.toPrismaCreate(mockUser)

      expect(result).toEqual({
        email: mockUser.email.value,
        password: mockUser.password,
        role: mockUser.role,
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt,
        client: {
          connect: {
            id: mockUser.clientId,
          },
        },
      })
    })

    it('should handle user with employee role', () => {
      const employeeUser = User.create(
        'employee@example.com',
        'hashed-password',
        UserRole.EMPLOYEE,
        undefined,
        'employee-123',
      )
      const result = UserMapper.toPrismaCreate(employeeUser)

      expect(result.role).toBe(UserRole.EMPLOYEE)
      expect(result.client).toBeUndefined()
      expect(result.employee).toEqual({
        connect: {
          id: 'employee-123',
        },
      })
    })

    it('should handle user with admin role', () => {
      const adminUser = User.create('admin@example.com', 'hashed-password', UserRole.ADMIN)
      const result = UserMapper.toPrismaCreate(adminUser)

      expect(result.role).toBe(UserRole.ADMIN)
      expect(result.client).toBeUndefined()
      expect(result.employee).toBeUndefined()
    })
  })

  describe('toPrismaUpdate', () => {
    it('should convert domain user to Prisma update input', () => {
      const result = UserMapper.toPrismaUpdate(mockUser)

      expect(result).toEqual({
        email: mockUser.email.value,
        password: mockUser.password,
        role: mockUser.role,
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt,
        client: {
          connect: {
            id: mockUser.clientId,
          },
        },
      })
    })

    it('should handle updated user with new lastLoginAt', () => {
      const updatedUser = mockUser.updateLastLogin()
      const result = UserMapper.toPrismaUpdate(updatedUser)

      expect(result.lastLoginAt).not.toEqual(mockUser.lastLoginAt)
      expect(result.lastLoginAt).toBeInstanceOf(Date)
    })

    it('should handle deactivated user', () => {
      const deactivatedUser = mockUser.deactivate()
      const result = UserMapper.toPrismaUpdate(deactivatedUser)

      expect(result.isActive).toBe(false)
    })
  })
})
