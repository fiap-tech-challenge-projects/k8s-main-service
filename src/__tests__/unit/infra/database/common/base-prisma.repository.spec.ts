import { Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import { BasePrismaRepository } from '@infra/database/common'
import { PaginatedResult } from '@shared'

interface TestEntity {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

interface TestPrismaModel {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

class TestRepository extends BasePrismaRepository<TestEntity, TestPrismaModel> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'TestRepository')
  }

  protected get modelName(): string {
    return 'test'
  }

  protected get mapper(): (prismaModel: TestPrismaModel) => TestEntity {
    return (prismaModel: TestPrismaModel) => ({
      id: prismaModel.id,
      name: prismaModel.name,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    })
  }

  protected get createMapper(): (entity: TestEntity) => Record<string, unknown> {
    return (entity: TestEntity) => ({
      name: entity.name,
    })
  }

  protected get updateMapper(): (entity: TestEntity) => Record<string, unknown> {
    return (entity: TestEntity) => ({
      name: entity.name,
    })
  }
}

describe('BasePrismaRepository', () => {
  let repository: TestRepository
  let mockPrisma: jest.Mocked<PrismaClient>
  let mockModel: any

  const mockEntity: TestEntity = {
    id: 'test-id',
    name: 'Test Entity',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockPrismaModel: TestPrismaModel = {
    id: 'test-id',
    name: 'Test Entity',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  beforeEach(() => {
    mockModel = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    }

    mockPrisma = {
      test: mockModel,
    } as any

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()

    repository = new TestRepository(mockPrisma)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('should find entity by id successfully', async () => {
      mockModel.findUnique.mockResolvedValue(mockPrismaModel)

      const result = await repository.findById('test-id')

      expect(mockModel.findUnique).toHaveBeenCalledWith({ where: { id: 'test-id' } })
      expect(result).toEqual(mockEntity)
    })

    it('should return null when entity not found', async () => {
      mockModel.findUnique.mockResolvedValue(null)

      const result = await repository.findById('test-id')

      expect(result).toBeNull()
    })

    it('should throw error when database operation fails', async () => {
      const error = new Error('Database error')
      mockModel.findUnique.mockRejectedValue(error)

      await expect(repository.findById('test-id')).rejects.toThrow('Database error')
    })
  })

  describe('findAll', () => {
    it('should find all entities with pagination', async () => {
      const mockPaginatedResult: PaginatedResult<TestEntity> = {
        data: [mockEntity],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }

      jest.spyOn(repository as any, 'findPaginated').mockResolvedValue(mockPaginatedResult)

      const result = await repository.findAll(1, 10)

      expect(result).toEqual(mockPaginatedResult)
    })
  })

  describe('create', () => {
    it('should create entity successfully', async () => {
      mockModel.create.mockResolvedValue(mockPrismaModel)

      const createData = { name: 'New Entity' }
      const result = await repository.create(createData)

      expect(mockModel.create).toHaveBeenCalledWith({ data: { name: 'New Entity' } })
      expect(result).toEqual(mockEntity)
    })

    it('should throw error when creation fails', async () => {
      const error = new Error('Creation failed')
      mockModel.create.mockRejectedValue(error)

      await expect(repository.create({ name: 'New Entity' })).rejects.toThrow('Creation failed')
    })
  })

  describe('update', () => {
    it('should update entity successfully', async () => {
      mockModel.update.mockResolvedValue(mockPrismaModel)

      const updateData = { name: 'Updated Entity' }
      const result = await repository.update('test-id', updateData)

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { name: 'Updated Entity' },
      })
      expect(result).toEqual(mockEntity)
    })

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed')
      mockModel.update.mockRejectedValue(error)

      await expect(repository.update('test-id', { name: 'Updated Entity' })).rejects.toThrow(
        'Update failed',
      )
    })
  })

  describe('delete', () => {
    it('should delete entity successfully', async () => {
      mockModel.delete.mockResolvedValue(mockPrismaModel)

      const result = await repository.delete('test-id')

      expect(mockModel.delete).toHaveBeenCalledWith({ where: { id: 'test-id' } })
      expect(result).toBe(true)
    })

    it('should return false when entity not found', async () => {
      mockModel.delete.mockRejectedValue(new Error('Record not found'))

      const result = await repository.delete('test-id')

      expect(result).toBe(false)
    })

    it('should return false when deletion fails with any error', async () => {
      const error = new Error('Deletion failed')
      mockModel.delete.mockRejectedValue(error)

      const result = await repository.delete('test-id')

      expect(result).toBe(false)
    })
  })

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      mockModel.count.mockResolvedValue(1)

      const result = await repository.exists('test-id')

      expect(mockModel.count).toHaveBeenCalledWith({ where: { id: 'test-id' } })
      expect(result).toBe(true)
    })

    it('should return false when entity does not exist', async () => {
      mockModel.count.mockResolvedValue(0)

      const result = await repository.exists('test-id')

      expect(result).toBe(false)
    })

    it('should throw error when check fails', async () => {
      const error = new Error('Check failed')
      mockModel.count.mockRejectedValue(error)

      await expect(repository.exists('test-id')).rejects.toThrow('Check failed')
    })
  })

  describe('findPaginated', () => {
    it('should return paginated results', async () => {
      mockModel.findMany.mockResolvedValue([mockPrismaModel])
      mockModel.count.mockResolvedValue(1)

      const result = await (repository as any).findPaginated({}, 1, 10, { createdAt: 'desc' })

      expect(result.data).toEqual([mockEntity])
      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
      expect(result.meta.total).toBe(1)
    })

    it('should throw InvalidPaginationException for invalid page number', async () => {
      mockModel.count.mockResolvedValue(10)

      await expect(
        (repository as any).findPaginated({}, 0, 10, { createdAt: 'desc' }),
      ).rejects.toThrow('Page number must be greater than 0, got 0')
    })

    it('should throw InvalidPaginationException for invalid limit', async () => {
      await expect(
        (repository as any).findPaginated({}, 1, 0, { createdAt: 'desc' }),
      ).rejects.toThrow('Limit must be greater than 0, got 0')
    })

    it('should throw InvalidPaginationException for limit exceeding maximum', async () => {
      await expect(
        (repository as any).findPaginated({}, 1, 101, { createdAt: 'desc' }),
      ).rejects.toThrow('Limit cannot exceed 100, got 101')
    })

    it('should throw InvalidPaginationException for page that does not exist', async () => {
      mockModel.count.mockResolvedValue(5)

      await expect(
        (repository as any).findPaginated({}, 3, 10, { createdAt: 'desc' }),
      ).rejects.toThrow('Page 3 does not exist. Total pages: 1')
    })

    it('should allow page 1 when no data exists', async () => {
      mockModel.count.mockResolvedValue(0)
      mockModel.findMany.mockResolvedValue([])

      const result = await (repository as any).findPaginated({}, 1, 10, { createdAt: 'desc' })

      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
      expect(result.meta.totalPages).toBe(0)
    })
  })

  describe('findByUniqueField', () => {
    it('should find entity by unique field', async () => {
      mockModel.findUnique.mockResolvedValue(mockPrismaModel)

      const result = await (repository as any).findByUniqueField('name', 'Test Entity')

      expect(mockModel.findUnique).toHaveBeenCalledWith({ where: { name: 'Test Entity' } })
      expect(result).toEqual(mockEntity)
    })

    it('should return null when not found', async () => {
      mockModel.findUnique.mockResolvedValue(null)

      const result = await (repository as any).findByUniqueField('name', 'Test Entity')

      expect(result).toBeNull()
    })
  })

  describe('uniqueFieldExists', () => {
    it('should return true when field exists', async () => {
      mockModel.count.mockResolvedValue(1)

      const result = await (repository as any).uniqueFieldExists('name', 'Test Entity')

      expect(mockModel.count).toHaveBeenCalledWith({ where: { name: 'Test Entity' } })
      expect(result).toBe(true)
    })

    it('should return false when field does not exist', async () => {
      mockModel.count.mockResolvedValue(0)

      const result = await (repository as any).uniqueFieldExists('name', 'Test Entity')

      expect(result).toBe(false)
    })
  })
})
