import { UserMapper } from '@infra/database/prisma/mappers'
/* eslint-disable import/no-internal-modules */
import { PrismaUserRepository } from '@infra/database/prisma/repositories/prisma-user.repository'

describe('PrismaUserRepository (unit)', () => {
  let mockPrisma: any
  let repo: PrismaUserRepository

  beforeEach(() => {
    mockPrisma = { user: { findUnique: jest.fn(), count: jest.fn() } }
    jest.spyOn(UserMapper, 'toDomain').mockImplementation((p: any) => ({ id: p.id }) as any)
    repo = new PrismaUserRepository(mockPrisma as any)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns domain user when prisma findUnique returns a user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1' })
    const user = await repo.findByEmail('a@b.com')
    expect(user).toEqual({ id: 'u-1' })
  })

  it('returns null when prisma findUnique returns null', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    const user = await repo.findByEmail('missing@b.com')
    expect(user).toBeNull()
  })

  it('throws when prisma client errors', async () => {
    const err = new Error('prisma fail')
    mockPrisma.user.findUnique.mockRejectedValue(err)

    await expect(repo.findByEmail('a@b.com')).rejects.toThrow(err)
  })

  it('findByEmail returns null when not found and emailExists returns boolean', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    jest.spyOn(UserMapper, 'toDomain').mockImplementation(() => ({}) as any)

    const res = await repo.findByEmail('x@y.com')

    expect(res).toBeNull()
    expect(mockPrisma.user.findUnique).toHaveBeenCalled()

    mockPrisma.user.count.mockResolvedValue(0)
    const exists = await repo.emailExists('x@y.com')
    expect(exists).toBe(false)
    expect(mockPrisma.user.count).toHaveBeenCalled()
  })
})
