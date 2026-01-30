import { RefreshToken as PrismaRefreshToken } from '@prisma/client'

// ...existing imports
import { RefreshTokenMapper } from '@infra/database/prisma/mappers'

describe('RefreshTokenMapper', () => {
  const mockPrismaRefreshToken: PrismaRefreshToken = {
    id: 'token-123',
    token: 'refresh-token-123',
    userId: 'user-123',
    expiresAt: new Date('2024-12-31T23:59:59Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
  }

  describe('toDomain', () => {
    it('converts prisma model to domain-like object', () => {
      const result = RefreshTokenMapper.toDomain(mockPrismaRefreshToken as any)

      expect(result.id).toBe(mockPrismaRefreshToken.id)
      expect(result.token).toBe(mockPrismaRefreshToken.token)
      expect(result.userId).toBe(mockPrismaRefreshToken.userId)
    })

    it('throws when prisma model is null', () => {
      expect(() => RefreshTokenMapper.toDomain(null as any)).toThrow(
        'Prisma RefreshToken cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('maps array of prisma tokens', () => {
      const res = RefreshTokenMapper.toDomainMany([mockPrismaRefreshToken] as any)
      expect(res).toHaveLength(1)
    })

    it('throws when input is not array', () => {
      expect(() => RefreshTokenMapper.toDomainMany(null as any)).toThrow(
        'Prisma RefreshTokens must be an array',
      )
    })
  })

  describe('toPrismaCreate / toPrismaUpdate', () => {
    it('builds prisma create input from domain-like entity', () => {
      const entity: any = { token: 't', userId: 'u', expiresAt: new Date() }
      const create = RefreshTokenMapper.toPrismaCreate(entity)
      expect(create).toHaveProperty('user')
      expect((create as any).user.connect.id).toBe('u')
    })

    it('builds prisma update input from domain-like entity', () => {
      const entity: any = { token: 't2', userId: 'u2', expiresAt: new Date() }
      const update = RefreshTokenMapper.toPrismaUpdate(entity as any)
      expect(update).toHaveProperty('user')
      expect((update as any).user.connect.id).toBe('u2')
      expect(update.token).toBe('t2')
    })

    it('throws when domain is null', () => {
      expect(() => RefreshTokenMapper.toPrismaCreate(null as any)).toThrow(
        'RefreshToken domain entity cannot be null or undefined',
      )
    })

    it('throws when updating with null domain', () => {
      expect(() => RefreshTokenMapper.toPrismaUpdate(null as any)).toThrow(
        'RefreshToken domain entity cannot be null or undefined',
      )
    })
  })
})
