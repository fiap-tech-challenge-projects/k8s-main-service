// pure-unit tests; no Nest TestingModule required
import { StockItem as PrismaStockItem } from '@prisma/client'

import { StockItemFactory } from '@/__tests__/factories'
import { StockItem } from '@domain/stock/entities'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PrismaStockRepository } from '@infra/database/prisma/repositories'
import { PaginatedResult } from '@shared/bases'
import { Price } from '@shared/value-objects'

describe('PrismaStockRepository', () => {
  let repository: PrismaStockRepository
  let mockPrismaService: jest.Mocked<PrismaService>

  const mockPrismaStock: PrismaStockItem = {
    id: 'stock-item-123',
    name: 'Filtro de Óleo',
    sku: 'FLT-001',
    currentStock: 10,
    minStockLevel: 5,
    unitCost: 2500, // 25.00 in cents
    unitSalePrice: 5000, // 50.00 in cents
    description: 'Filtro de óleo automotivo',
    supplier: 'Bosch',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z'),
  }

  const mockStockItem = new StockItem(
    'stock-item-123',
    'Filtro de Óleo',
    'FLT-001',
    10,
    5,
    Price.create('25.00'),
    Price.create('50.00'),
    'Filtro de óleo automotivo',
    'Bosch',
    new Date('2025-01-01T10:00:00Z'),
    new Date('2025-01-01T12:00:00Z'),
  )

  const mockStockModel = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  }

  beforeEach(async () => {
    mockPrismaService = {
      stockItem: mockStockModel,
    } as unknown as jest.Mocked<PrismaService>

    // instantiate repository directly
    repository = new PrismaStockRepository(mockPrismaService as any)

    // Suppress logger during tests
    jest.spyOn(repository['logger'], 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('should return stock item when found', async () => {
      // Arrange
      mockStockModel.findUnique.mockResolvedValue(mockPrismaStock)

      // Act
      const result = await repository.findById('stock-item-123')

      // Assert
      expect(mockStockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'stock-item-123' },
      })
      expect(result).toBeInstanceOf(StockItem)
      expect(result?.id).toBe('stock-item-123')
      expect(result?.name).toBe('Filtro de Óleo')
      expect(result?.sku).toBe('FLT-001')
    })

    it('should return null when stock item not found', async () => {
      // Arrange
      mockStockModel.findUnique.mockResolvedValue(null)

      // Act
      const result = await repository.findById('non-existent-id')

      // Assert
      expect(mockStockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      })
      expect(result).toBeNull()
    })

    it('should throw error when database operation fails', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed')
      mockStockModel.findUnique.mockRejectedValue(databaseError)

      // Act & Assert
      await expect(repository.findById('stock-item-123')).rejects.toThrow(databaseError)
      expect(mockStockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'stock-item-123' },
      })
    })
  })

  describe('findBySku', () => {
    it('should return stock item when found by SKU', async () => {
      // Arrange
      mockStockModel.findUnique.mockResolvedValue(mockPrismaStock)

      // Act
      const result = await repository.findBySku('FLT-001')

      // Assert
      expect(mockStockModel.findUnique).toHaveBeenCalledWith({
        where: { sku: 'FLT-001' },
      })
      expect(result).toBeInstanceOf(StockItem)
      expect(result?.sku).toBe('FLT-001')
    })

    it('should return null when SKU not found', async () => {
      // Arrange
      mockStockModel.findUnique.mockResolvedValue(null)

      // Act
      const result = await repository.findBySku('NON-EXISTENT')

      // Assert
      expect(mockStockModel.findUnique).toHaveBeenCalledWith({
        where: { sku: 'NON-EXISTENT' },
      })
      expect(result).toBeNull()
    })

    it('should throw error when database operation fails', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed')
      mockStockModel.findUnique.mockRejectedValue(databaseError)

      // Act & Assert
      await expect(repository.findBySku('FLT-001')).rejects.toThrow(databaseError)
    })
  })

  describe('findByName', () => {
    it('should return paginated stock items when found by name', async () => {
      // Arrange
      mockStockModel.findMany.mockResolvedValue([mockPrismaStock])
      mockStockModel.count.mockResolvedValue(1)

      // Act
      const result = await repository.findByName('Filtro', 1, 10)

      // Assert
      expect(mockStockModel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          name: {
            contains: 'Filtro',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(mockStockModel.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'Filtro',
            mode: 'insensitive',
          },
        },
      })
      expect(result).toEqual<PaginatedResult<StockItem>>({
        data: expect.arrayContaining([expect.any(StockItem)]),
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })
    })

    it('should return empty result when no items found by name', async () => {
      // Arrange
      mockStockModel.findMany.mockResolvedValue([])
      mockStockModel.count.mockResolvedValue(0)

      // Act
      const result = await repository.findByName('Non-existent Item')

      // Assert
      expect(mockStockModel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          name: {
            contains: 'Non-existent Item',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })

    it('should throw error when database operation fails', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed')
      mockStockModel.findMany.mockRejectedValue(databaseError)

      // Act & Assert
      await expect(repository.findByName('Filtro')).rejects.toThrow(databaseError)
    })
  })

  describe('findBySupplier', () => {
    it('should return paginated stock items when found by supplier', async () => {
      // Arrange
      mockStockModel.findMany.mockResolvedValue([mockPrismaStock])
      mockStockModel.count.mockResolvedValue(1)

      // Act
      const result = await repository.findBySupplier('Bosch', 1, 10)

      // Assert
      expect(mockStockModel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          supplier: {
            contains: 'Bosch',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(mockStockModel.count).toHaveBeenCalledWith({
        where: {
          supplier: {
            contains: 'Bosch',
            mode: 'insensitive',
          },
        },
      })
      expect(result).toEqual<PaginatedResult<StockItem>>({
        data: expect.arrayContaining([expect.any(StockItem)]),
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })
    })

    it('should return empty result when no items found by supplier', async () => {
      // Arrange
      mockStockModel.findMany.mockResolvedValue([])
      mockStockModel.count.mockResolvedValue(0)

      // Act
      const result = await repository.findBySupplier('Unknown Supplier')

      // Assert
      expect(mockStockModel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          supplier: {
            contains: 'Unknown Supplier',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })

    it('should throw error when database operation fails', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed')
      mockStockModel.findMany.mockRejectedValue(databaseError)

      // Act & Assert
      await expect(repository.findBySupplier('Bosch')).rejects.toThrow(databaseError)
    })
  })

  describe('create', () => {
    it('should create stock item successfully', async () => {
      // Arrange
      mockStockModel.create.mockResolvedValue(mockPrismaStock)

      const stockItem = StockItemFactory.create({
        name: 'Filtro de Óleo',
        sku: 'FLT-001',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: '25.50',
        unitSalePrice: '50.00',
        description: 'Filtro de óleo automotivo',
        supplier: 'Bosch',
      })

      // Act
      const result = await repository.create(stockItem)

      // Assert
      expect(mockStockModel.create).toHaveBeenCalledWith({
        data: {
          name: 'Filtro de Óleo',
          sku: 'FLT-001',
          currentStock: 10,
          minStockLevel: 5,
          unitCost: 2550, // 25.50 in cents
          unitSalePrice: 5000, // 50.00 in cents
          description: 'Filtro de óleo automotivo',
          supplier: 'Bosch',
        },
      })
      expect(result).toBeInstanceOf(StockItem)
      expect(result.id).toBe('stock-item-123')
    })

    it('should create stock item with null optional fields', async () => {
      // Arrange
      const stockItem = StockItemFactory.createMinimal({
        name: 'Pneu',
        sku: 'PNE-002',
        currentStock: 20,
        minStockLevel: 3,
        unitCost: '200.00',
        unitSalePrice: '300.00',
      })

      const prismaStockWithoutOptionals = {
        ...mockPrismaStock,
        id: 'stock-item-456',
        name: 'Pneu',
        sku: 'PNE-002',
        currentStock: 20,
        minStockLevel: 3,
        unitCost: 200.0,
        unitSalePrice: 300.0,
        description: null,
        supplier: null,
      }

      mockStockModel.create.mockResolvedValue(prismaStockWithoutOptionals)

      // Act
      const result = await repository.create(stockItem)

      // Assert
      expect(mockStockModel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Pneu',
          sku: 'PNE-002',
          currentStock: 20,
          minStockLevel: 3,
          unitCost: 20000,
          unitSalePrice: 30000,
          description: undefined,
          supplier: undefined,
        }),
      })
      expect(result).toBeInstanceOf(StockItem)
    })

    it('should throw error when database create fails', async () => {
      // Arrange
      const databaseError = new Error('Unique constraint violation')
      mockStockModel.create.mockRejectedValue(databaseError)

      const stockItem = StockItemFactory.create({
        name: 'Filtro de Óleo',
        sku: 'FLT-001',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: '25.50',
        unitSalePrice: '50.00',
        description: 'Filtro de óleo automotivo',
        supplier: 'Bosch',
      })

      // Act & Assert
      await expect(repository.create(stockItem)).rejects.toThrow(databaseError)
    })
  })

  describe('update', () => {
    it('should update stock item successfully', async () => {
      // Arrange
      const updatedPrismaStock = {
        ...mockPrismaStock,
        name: 'Updated Filter',
        currentStock: 15,
        updatedAt: new Date(),
      }
      mockStockModel.update.mockResolvedValue(updatedPrismaStock)

      const updatedDto = {
        name: 'Updated Filter',
        currentStock: 15,
        minStockLevel: mockStockItem.minStockLevel,
        unitCost: mockStockItem.unitCost,
        unitSalePrice: mockStockItem.unitSalePrice,
        description: mockStockItem.description,
        supplier: mockStockItem.supplier,
      }

      // Act
      const result = await repository.update('stock-item-123', updatedDto)

      // Assert
      expect(mockStockModel.update).toHaveBeenCalledWith({
        where: { id: 'stock-item-123' },
        data: expect.objectContaining({
          name: 'Updated Filter',
          currentStock: 15,
          updatedAt: expect.any(Date),
        }),
      })
      expect(result).toBeInstanceOf(StockItem)
      expect(result.name).toBe('Updated Filter')
    })

    it('should throw error when update fails', async () => {
      // Arrange
      const databaseError = new Error('Record not found')
      mockStockModel.update.mockRejectedValue(databaseError)

      const updatedEntity = new StockItem(
        'non-existent-id',
        'Updated Filter',
        'UPD-001',
        15,
        5,
        Price.create('30.00'),
        Price.create('60.00'),
        'Updated description',
        'Updated supplier',
        new Date('2025-01-01T10:00:00Z'),
        new Date(),
      )

      // Act & Assert
      await expect(repository.update('non-existent-id', updatedEntity)).rejects.toThrow(
        databaseError,
      )
    })
  })

  describe('delete', () => {
    it('should delete stock item successfully', async () => {
      // Arrange
      mockStockModel.delete.mockResolvedValue(mockPrismaStock)

      // Act
      const result = await repository.delete('stock-item-123')

      // Assert
      expect(mockStockModel.delete).toHaveBeenCalledWith({
        where: { id: 'stock-item-123' },
      })
      expect(result).toBe(true)
    })

    it('should return false when stock item not found for deletion', async () => {
      // Arrange
      const notFoundError = new Error('Record not found')
      mockStockModel.delete.mockRejectedValue(notFoundError)

      // Act
      const result = await repository.delete('non-existent-id')

      // Assert
      expect(mockStockModel.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      })
      expect(result).toBe(false)
    })
  })

  describe('findAll', () => {
    it('should return paginated stock items', async () => {
      // Arrange
      mockStockModel.findMany.mockResolvedValue([mockPrismaStock])
      mockStockModel.count.mockResolvedValue(1)

      // Act
      const result = await repository.findAll(1, 10)

      // Assert
      expect(mockStockModel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { createdAt: 'desc' },
      })
      expect(mockStockModel.count).toHaveBeenCalledWith({ where: {} })
      expect(result).toEqual<PaginatedResult<StockItem>>({
        data: expect.arrayContaining([expect.any(StockItem)]),
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })
    })

    it('should return all items when no pagination provided', async () => {
      // Arrange
      mockStockModel.findMany.mockResolvedValue([mockPrismaStock])
      mockStockModel.count.mockResolvedValue(1)

      // Act
      const result = await repository.findAll()

      // Assert
      expect(mockStockModel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10, // Default limit when no limit provided
        where: {},
        orderBy: { createdAt: 'desc' },
      })
      expect(result.data).toHaveLength(1)
    })

    it('should throw error when findAll fails', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed')
      mockStockModel.findMany.mockRejectedValue(databaseError)

      // Act & Assert
      await expect(repository.findAll(1, 10)).rejects.toThrow(databaseError)
    })
  })

  describe('exists', () => {
    it('should return true when stock item exists', async () => {
      // Arrange
      mockStockModel.count.mockResolvedValue(1)

      // Act
      const result = await repository.exists('stock-item-123')

      // Assert
      expect(mockStockModel.count).toHaveBeenCalledWith({
        where: { id: 'stock-item-123' },
      })
      expect(result).toBe(true)
    })

    it('should return false when stock item does not exist', async () => {
      // Arrange
      mockStockModel.count.mockResolvedValue(0)

      // Act
      const result = await repository.exists('non-existent-id')

      // Assert
      expect(mockStockModel.count).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      })
      expect(result).toBe(false)
    })

    it('should throw error when exists check fails', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed')
      mockStockModel.count.mockRejectedValue(databaseError)

      // Act & Assert
      await expect(repository.exists('stock-item-123')).rejects.toThrow(databaseError)
    })
  })
})
