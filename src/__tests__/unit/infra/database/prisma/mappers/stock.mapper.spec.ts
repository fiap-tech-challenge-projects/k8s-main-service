import { StockItem as PrismaStockItem } from '@prisma/client'

import { StockItem } from '@domain/stock/entities'
import { StockMapper } from '@infra/database/prisma/mappers'
import { Price } from '@shared/value-objects'

describe('StockMapper', () => {
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

  const mockPrismaStockWithNulls: PrismaStockItem = {
    id: 'stock-item-456',
    name: 'Pneu',
    sku: 'PNE-002',
    currentStock: 20,
    minStockLevel: 3,
    unitCost: 20000, // 200.00 in cents
    unitSalePrice: 30000, // 300.00 in cents
    description: null,
    supplier: null,
    createdAt: new Date('2025-01-02T10:00:00Z'),
    updatedAt: new Date('2025-01-02T10:00:00Z'),
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

  const mockStockItemWithUndefined = new StockItem(
    'stock-item-456',
    'Pneu',
    'PNE-002',
    20,
    3,
    Price.create('200.00'),
    Price.create('300.00'),
    undefined,
    undefined,
    new Date('2025-01-02T10:00:00Z'),
    new Date('2025-01-02T10:00:00Z'),
  )

  describe('toDomain', () => {
    it('should convert PrismaStockItem to StockItem with all properties', () => {
      // Act
      const result = StockMapper.toDomain(mockPrismaStock)

      // Assert
      expect(result).toBeInstanceOf(StockItem)
      expect(result.id).toBe('stock-item-123')
      expect(result.name).toBe('Filtro de Óleo')
      expect(result.sku).toBe('FLT-001')
      expect(result.currentStock).toBe(10)
      expect(result.minStockLevel).toBe(5)
      expect(result.unitCost).toBeInstanceOf(Price)
      expect(result.unitCost.getValue()).toBe(2500) // 25.00 in cents
      expect(result.unitSalePrice).toBeInstanceOf(Price)
      expect(result.unitSalePrice.getValue()).toBe(5000) // 50.00 in cents
      expect(result.description).toBe('Filtro de óleo automotivo')
      expect(result.supplier).toBe('Bosch')
      expect(result.createdAt).toEqual(new Date('2025-01-01T10:00:00Z'))
      expect(result.updatedAt).toEqual(new Date('2025-01-01T12:00:00Z'))
    })

    it('should convert PrismaStockItem to StockItem with null properties as undefined', () => {
      // Act
      const result = StockMapper.toDomain(mockPrismaStockWithNulls)

      // Assert
      expect(result).toBeInstanceOf(StockItem)
      expect(result.id).toBe('stock-item-456')
      expect(result.name).toBe('Pneu')
      expect(result.sku).toBe('PNE-002')
      expect(result.currentStock).toBe(20)
      expect(result.minStockLevel).toBe(3)
      expect(result.unitCost).toBeInstanceOf(Price)
      expect(result.unitCost.getValue()).toBe(20000) // 200.00 in cents
      expect(result.unitSalePrice).toBeInstanceOf(Price)
      expect(result.unitSalePrice.getValue()).toBe(30000) // 300.00 in cents
      expect(result.description).toBeUndefined()
      expect(result.supplier).toBeUndefined()
      expect(result.createdAt).toEqual(new Date('2025-01-02T10:00:00Z'))
      expect(result.updatedAt).toEqual(new Date('2025-01-02T10:00:00Z'))
    })

    it('should throw error when PrismaStockItem is null', () => {
      // Act & Assert
      expect(() => StockMapper.toDomain(null as any)).toThrow(
        'Prisma Stock model cannot be null or undefined',
      )
    })

    it('should throw error when PrismaStockItem is undefined', () => {
      // Act & Assert
      expect(() => StockMapper.toDomain(undefined as any)).toThrow(
        'Prisma Stock model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('should convert array of PrismaStockItem to array of StockItem', () => {
      // Arrange
      const prismaStockArray = [mockPrismaStock, mockPrismaStockWithNulls]

      // Act
      const result = StockMapper.toDomainMany(prismaStockArray)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(StockItem)
      expect(result[0].id).toBe('stock-item-123')
      expect(result[1]).toBeInstanceOf(StockItem)
      expect(result[1].id).toBe('stock-item-456')
    })

    it('should return empty array when input is not an array', () => {
      // Act
      const result = StockMapper.toDomainMany(null as any)

      // Assert
      expect(result).toEqual([])
    })

    it('should filter out null and undefined items', () => {
      // Arrange
      const prismaStockArrayWithNulls = [mockPrismaStock, null, undefined, mockPrismaStockWithNulls]

      // Act
      const result = StockMapper.toDomainMany(prismaStockArrayWithNulls as PrismaStockItem[])

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('stock-item-123')
      expect(result[1].id).toBe('stock-item-456')
    })

    it('should return empty array when all items are null or undefined', () => {
      // Arrange
      const prismaStockArrayAllNulls = [null, undefined, null]

      // Act
      const result = StockMapper.toDomainMany(prismaStockArrayAllNulls as any)

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert StockItem to Prisma create input with all properties', () => {
      // Act
      const result = StockMapper.toPrismaCreate(mockStockItem)

      // Assert
      expect(result).toEqual({
        name: 'Filtro de Óleo',
        sku: 'FLT-001',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: 2500, // 25.00 in cents
        unitSalePrice: 5000, // 50.00 in cents
        description: 'Filtro de óleo automotivo',
        supplier: 'Bosch',
      })
    })

    it('should convert StockItem to Prisma create input with undefined properties as null', () => {
      // Act
      const result = StockMapper.toPrismaCreate(mockStockItemWithUndefined)

      // Assert
      expect(result).toEqual({
        name: 'Pneu',
        sku: 'PNE-002',
        currentStock: 20,
        minStockLevel: 3,
        unitCost: 20000, // 200.00 in cents
        unitSalePrice: 30000, // 300.00 in cents
        description: undefined,
        supplier: undefined,
      })
    })

    it('should throw error when StockItem is null', () => {
      // Act & Assert
      expect(() => StockMapper.toPrismaCreate(null as any)).toThrow(
        'StockItem domain entity cannot be null or undefined',
      )
    })

    it('should throw error when StockItem is undefined', () => {
      // Act & Assert
      expect(() => StockMapper.toPrismaCreate(undefined as any)).toThrow(
        'StockItem domain entity cannot be null or undefined',
      )
    })
  })

  describe('toPrismaUpdate', () => {
    it('should convert StockItem to Prisma update input with all properties', () => {
      // Act
      const result = StockMapper.toPrismaUpdate(mockStockItem)

      // Assert
      expect(result).toEqual({
        name: 'Filtro de Óleo',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: 2500, // 25.00 in cents
        unitSalePrice: 5000, // 50.00 in cents
        description: 'Filtro de óleo automotivo',
        supplier: 'Bosch',
        updatedAt: expect.any(Date),
      })
    })

    it('should convert StockItem to Prisma update input with undefined properties as null', () => {
      // Act
      const result = StockMapper.toPrismaUpdate(mockStockItemWithUndefined)

      // Assert
      expect(result).toEqual({
        name: 'Pneu',
        currentStock: 20,
        minStockLevel: 3,
        unitCost: 20000, // 200.00 in cents
        unitSalePrice: 30000, // 300.00 in cents
        description: undefined,
        supplier: undefined,
        updatedAt: expect.any(Date),
      })
    })

    it('should include updated timestamp in Prisma update input', () => {
      // Arrange
      const beforeUpdate = new Date()

      // Act
      const result = StockMapper.toPrismaUpdate(mockStockItem)

      // Assert
      expect(result.updatedAt).toBeInstanceOf(Date)
      const resultDate = result.updatedAt as Date
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
    })

    it('should throw error when StockItem is null', () => {
      // Act & Assert
      expect(() => StockMapper.toPrismaUpdate(null as any)).toThrow(
        'StockItem domain entity cannot be null or undefined',
      )
    })

    it('should throw error when StockItem is undefined', () => {
      // Act & Assert
      expect(() => StockMapper.toPrismaUpdate(undefined as any)).toThrow(
        'StockItem domain entity cannot be null or undefined',
      )
    })
  })

  describe('field mapping verification', () => {
    it('should correctly map field names between domain and prisma models', () => {
      // This test ensures the field mapping is correct between domain and Prisma models

      // Act
      const domainEntity = StockMapper.toDomain(mockPrismaStock)
      const prismaCreate = StockMapper.toPrismaCreate(domainEntity)

      // Assert - verify field mapping consistency
      expect(prismaCreate.name).toBe(mockPrismaStock.name)
      expect(prismaCreate.sku).toBe(mockPrismaStock.sku)
      expect(prismaCreate.currentStock).toBe(mockPrismaStock.currentStock)
      expect(prismaCreate.minStockLevel).toBe(mockPrismaStock.minStockLevel)
      expect(prismaCreate.unitCost).toBe(mockPrismaStock.unitCost)
      expect(prismaCreate.unitSalePrice).toBe(mockPrismaStock.unitSalePrice)
      expect(prismaCreate.description).toBe(mockPrismaStock.description)
      expect(prismaCreate.supplier).toBe(mockPrismaStock.supplier)
    })

    it('should handle round-trip conversion correctly', () => {
      // Test that converting Prisma -> Domain -> Prisma maintains data integrity
      // Note: SKU is not included in update conversions as it should be immutable

      // Act
      const domainEntity = StockMapper.toDomain(mockPrismaStock)
      const backToPrisma = StockMapper.toPrismaUpdate(domainEntity)

      // Assert
      expect(backToPrisma.name).toBe(mockPrismaStock.name)
      // SKU is not included in updates (immutable field)
      expect(backToPrisma.currentStock).toBe(mockPrismaStock.currentStock)
      expect(backToPrisma.minStockLevel).toBe(mockPrismaStock.minStockLevel)
      expect(backToPrisma.unitCost).toBe(mockPrismaStock.unitCost)
      expect(backToPrisma.unitSalePrice).toBe(mockPrismaStock.unitSalePrice)
      expect(backToPrisma.description).toBe(mockPrismaStock.description)
      expect(backToPrisma.supplier).toBe(mockPrismaStock.supplier)
      expect(backToPrisma.updatedAt).toBeInstanceOf(Date)
    })
  })
})
