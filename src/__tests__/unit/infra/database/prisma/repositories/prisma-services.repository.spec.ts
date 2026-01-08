import { Logger } from '@nestjs/common'

import { ServiceMapper } from '@infra/database/prisma/mappers'
import { PrismaServiceRepository } from '@infra/database/prisma/repositories'

describe('PrismaServiceRepository (pure unit)', () => {
  let repo: PrismaServiceRepository
  const mockPrisma = { service: { count: jest.fn(), findMany: jest.fn() } }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockPrisma.service.count.mockReset()
    mockPrisma.service.findMany.mockReset()

    repo = new PrismaServiceRepository(mockPrisma as any)
  })

  afterAll(() => jest.restoreAllMocks())

  it('returns paginated services when mapping succeeds', async () => {
    const prismaItems = [
      { id: 's1', name: 'A' },
      { id: 's2', name: 'B' },
      { id: 's3', name: 'C' },
    ]

    mockPrisma.service.count.mockResolvedValue(3)
    mockPrisma.service.findMany.mockResolvedValue(prismaItems)
    ;(jest.spyOn(ServiceMapper as any, 'toDomain') as any).mockImplementation(
      (p: any) => ({ id: p.id, name: p.name }) as any,
    )

    const res = await repo.findByName('x', 2, 1)

    expect(mockPrisma.service.count).toHaveBeenCalledWith({
      where: { name: { contains: 'x', mode: 'insensitive' } },
    })
    expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'x', mode: 'insensitive' } },
      skip: 1,
      take: 1,
    })

    expect(res.meta.page).toBe(2)
    expect(res.meta.limit).toBe(1)
    expect(res.meta.total).toBe(3)
    expect(res.meta.totalPages).toBe(3)
    expect(res.meta.hasNext).toBe(true)
    expect(res.meta.hasPrev).toBe(true)
    expect(res.data.length).toBe(3)
  })

  it('skips invalid mapped records and logs warnings/errors', async () => {
    const prismaItems = [
      { id: 's1', name: 'A' },
      { id: 's-bad', name: 'BAD' },
    ]

    mockPrisma.service.count.mockResolvedValue(2)
    mockPrisma.service.findMany.mockResolvedValue(prismaItems)

    const mapSpy = jest.spyOn(ServiceMapper, 'toDomain')
    mapSpy.mockImplementation((p: any) => {
      if (p.id === 's-bad') throw new Error('invalid')
      return {
        id: p.id,
        name: p.name,
      } as any
    })

    const warnSpy = jest.spyOn(Logger.prototype, 'warn')
    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const res = await repo.findByName('y')

    expect(mapSpy).toHaveBeenCalled()
    // one valid item should remain
    expect(res.data.length).toBe(1)
    expect(warnSpy).toHaveBeenCalled()
    expect(errSpy).toHaveBeenCalled()
  })

  it('logs and rethrows when prisma throws', async () => {
    mockPrisma.service.count.mockRejectedValue(new Error('db'))

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    await expect(repo.findByName('z')).rejects.toThrow('db')
    expect(errSpy).toHaveBeenCalled()
  })
})
