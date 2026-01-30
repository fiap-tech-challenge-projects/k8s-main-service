import { PrismaClient, Prisma } from '@prisma/client'

import { Service } from '@domain/services/entities'
import { PrismaServiceRepository } from '@infra/database/prisma/repositories'

type MockServiceDelegate = Prisma.ServiceDelegate & {
  count: jest.Mock<any, any>
  findMany: jest.Mock<any, any>
}

describe('PrismaServiceRepository', () => {
  let repository: PrismaServiceRepository
  let prismaMock: Partial<PrismaClient> & { service: MockServiceDelegate }

  const mockPrismaServicesData = [
    {
      id: 'service-1',
      name: 'Troca de óleo',
      price: 1000,
      description: 'Troca de óleo do motor',
      estimatedDuration: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'service-2',
      name: 'Alinhamento',
      price: 500,
      description: 'Alinhamento das rodas',
      estimatedDuration: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    prismaMock = {
      service: {
        count: jest.fn().mockResolvedValue(mockPrismaServicesData.length),
        findMany: jest.fn().mockResolvedValue(mockPrismaServicesData),
      } as any,
    }

    repository = new PrismaServiceRepository(prismaMock as any)
    jest.spyOn(repository['logger'], 'error').mockImplementation(() => {})
    jest.spyOn(repository['logger'], 'warn').mockImplementation(() => {})
  })

  it('should return paginated services filtered by name', async () => {
    const nameToSearch = 'troca'
    const page = 1
    const limit = 10

    const result = await repository.findByName(nameToSearch, page, limit)

    expect(prismaMock.service.count).toHaveBeenCalledWith({
      where: { name: { contains: nameToSearch, mode: 'insensitive' } },
    })
    expect(prismaMock.service.findMany).toHaveBeenCalledWith({
      where: { name: { contains: nameToSearch, mode: 'insensitive' } },
      skip: 0,
      take: limit,
    })

    expect(result.data).toHaveLength(mockPrismaServicesData.length)
    expect(result.meta.page).toBe(page)
    expect(result.meta.limit).toBe(limit)
    expect(result.meta.total).toBe(mockPrismaServicesData.length)
    expect(result.meta.totalPages).toBe(1)
    expect(result.meta.hasNext).toBe(false)
    expect(result.meta.hasPrev).toBe(false)

    for (const service of result.data) {
      expect(service).toBeInstanceOf(Service)
    }
  })
})
