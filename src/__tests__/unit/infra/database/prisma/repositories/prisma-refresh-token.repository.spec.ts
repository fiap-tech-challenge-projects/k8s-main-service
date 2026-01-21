import { Logger } from '@nestjs/common'

import { RefreshTokenMapper } from '@infra/database/prisma/mappers'
import { PrismaRefreshTokenRepository } from '@infra/database/prisma/repositories'

describe('PrismaRefreshTokenRepository (pure unit)', () => {
  let repo: PrismaRefreshTokenRepository

  const mockPrisma = {
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockPrisma.refreshToken.findUnique.mockReset()
    mockPrisma.refreshToken.findMany.mockReset()
    mockPrisma.refreshToken.deleteMany.mockReset()

    repo = new PrismaRefreshTokenRepository(mockPrisma as any)
  })

  afterAll(() => jest.restoreAllMocks())

  describe('findByToken', () => {
    it('returns mapped domain when prisma returns a record', async () => {
      const token = 't-1'
      const prismaObj = { id: 'r1', token, userId: 'u1', expiresAt: new Date() }
      const domainObj = { id: 'r1', token, userId: 'u1' }

      mockPrisma.refreshToken.findUnique.mockResolvedValue(prismaObj)
      const spy = jest.spyOn(RefreshTokenMapper, 'toDomain').mockReturnValue(domainObj as any)

      const res = await repo.findByToken(token)

      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({ where: { token } })
      expect(spy).toHaveBeenCalledWith(prismaObj)
      expect(res).toEqual(domainObj)
    })

    it('returns null when prisma returns null', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null)

      const res = await repo.findByToken('nope')

      expect(res).toBeNull()
    })

    it('propagates error and logs when prisma throws', async () => {
      const err = new Error('boom')
      mockPrisma.refreshToken.findUnique.mockRejectedValue(err)
      const errSpy = jest.spyOn(Logger.prototype, 'error')

      await expect(repo.findByToken('t')).rejects.toThrow(err)
      expect(errSpy).toHaveBeenCalled()
    })
  })

  describe('findByUserId', () => {
    it('returns mapped array when prisma returns records', async () => {
      const userId = 'u-1'
      const prismaItems = [
        { id: 'r1', token: 't1', userId, expiresAt: new Date() },
        { id: 'r2', token: 't2', userId, expiresAt: new Date() },
      ]
      const domainItems = prismaItems.map((p) => ({ id: p.id, token: p.token, userId: p.userId }))

      mockPrisma.refreshToken.findMany.mockResolvedValue(prismaItems)
      const spy = jest.spyOn(RefreshTokenMapper, 'toDomain')
      spy.mockImplementation((p: any) => ({ id: p.id, token: p.token, userId: p.userId }) as any)

      const res = await repo.findByUserId(userId)

      expect(mockPrisma.refreshToken.findMany).toHaveBeenCalledWith({ where: { userId } })
      expect(spy).toHaveBeenCalled()
      expect(res).toEqual(domainItems)
    })

    it('returns empty array when none found', async () => {
      mockPrisma.refreshToken.findMany.mockResolvedValue([])

      const res = await repo.findByUserId('u-none')

      expect(res).toEqual([])
    })

    it('propagates error and logs when prisma throws', async () => {
      const err = new Error('db')
      mockPrisma.refreshToken.findMany.mockRejectedValue(err)
      const errSpy = jest.spyOn(Logger.prototype, 'error')

      await expect(repo.findByUserId('u')).rejects.toThrow(err)
      expect(errSpy).toHaveBeenCalled()
    })
  })

  describe('deleteByUserId', () => {
    it('calls prisma.deleteMany with userId', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 })

      await expect(repo.deleteByUserId('u-1')).resolves.toBeUndefined()
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u-1' } })
    })

    it('logs and throws when prisma.deleteMany fails', async () => {
      const err = new Error('del')
      mockPrisma.refreshToken.deleteMany.mockRejectedValue(err)
      const errSpy = jest.spyOn(Logger.prototype, 'error')

      await expect(repo.deleteByUserId('u-x')).rejects.toThrow(err)
      expect(errSpy).toHaveBeenCalled()
    })
  })

  describe('deleteExpired', () => {
    it('calls deleteMany with expiresAt.lt Date', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 })

      await expect(repo.deleteExpired()).resolves.toBeUndefined()

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      })
    })

    it('logs and throws when deleteMany fails', async () => {
      const err = new Error('boom')
      mockPrisma.refreshToken.deleteMany.mockRejectedValue(err)
      const errSpy = jest.spyOn(Logger.prototype, 'error')

      await expect(repo.deleteExpired()).rejects.toThrow(err)
      expect(errSpy).toHaveBeenCalled()
    })
  })
})
