import {
  CreateStockItemDto,
  StockItemResponseDto,
  UpdateStockItemDto,
} from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { StockItem } from '@domain/stock/entities'
import { Price } from '@shared/value-objects'

describe('StockItemMapper', () => {
  describe('toResponseDto', () => {
    it('should convert StockItem to StockItemResponseDto with all properties', () => {
      // Arrange
      const entity = new StockItem(
        'stock-item-123',
        'Filtro de Óleo',
        'FLT-001',
        10,
        5,
        Price.create('25.50'),
        Price.create('50.00'),
        'Filtro de óleo automotivo',
        'Bosch',
        new Date('2025-01-01T10:00:00Z'),
        new Date('2025-01-01T12:00:00Z'),
      )

      // Act
      const result = StockItemMapper.toResponseDto(entity)

      // Assert
      expect(result).toEqual<StockItemResponseDto>({
        id: 'stock-item-123',
        name: 'Filtro de Óleo',
        sku: 'FLT-001',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: 'R$\u00A025,50',
        unitSalePrice: 'R$\u00A050,00',
        description: 'Filtro de óleo automotivo',
        supplier: 'Bosch',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      })
    })

    it('should convert StockItem to StockItemResponseDto with optional properties as undefined', () => {
      // Arrange
      const entity = new StockItem(
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

      // Act
      const result = StockItemMapper.toResponseDto(entity)

      // Assert
      expect(result).toEqual<StockItemResponseDto>({
        id: 'stock-item-456',
        name: 'Pneu',
        sku: 'PNE-002',
        currentStock: 20,
        minStockLevel: 3,
        unitCost: 'R$\u00A0200,00',
        unitSalePrice: 'R$\u00A0300,00',
        description: undefined,
        supplier: undefined,
        createdAt: new Date('2025-01-02T10:00:00Z'),
        updatedAt: new Date('2025-01-02T10:00:00Z'),
      })
    })
  })

  describe('fromRegisterDto', () => {
    it('should convert CreateStockItemDto to StockItem', () => {
      // Arrange
      const dto: CreateStockItemDto = {
        name: 'Pastilha de Freio',
        sku: 'PST-003',
        currentStock: 15,
        minStockLevel: 4,
        unitCost: '35.00',
        unitSalePrice: '70.00',
        description: 'Pastilha de freio cerâmica',
        supplier: 'Brembo',
      }

      // Act
      const result = StockItemMapper.fromCreateDto(dto)

      // Assert
      expect(result).toBeInstanceOf(StockItem)
      expect(result.name).toBe(dto.name)
      expect(result.sku).toBe(dto.sku)
      expect(result.currentStock).toBe(dto.currentStock)
      expect(result.minStockLevel).toBe(dto.minStockLevel)
      expect(result.unitCost.getValue()).toBe(3500) // 35.0 in cents
      expect(result.unitSalePrice.getValue()).toBe(7000) // 70.0 in cents
      expect(result.description).toBe(dto.description)
      expect(result.supplier).toBe(dto.supplier)
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should convert CreateStockItemDto to StockItem with optional properties undefined', () => {
      // Arrange
      const dto: CreateStockItemDto = {
        name: 'Bateria',
        sku: 'BAT-004',
        currentStock: 8,
        minStockLevel: 2,
        unitCost: '150.00',
        unitSalePrice: '250.00',
        description: undefined,
        supplier: undefined,
      }

      // Act
      const result = StockItemMapper.fromCreateDto(dto)

      // Assert
      expect(result).toBeInstanceOf(StockItem)
      expect(result.name).toBe(dto.name)
      expect(result.sku).toBe(dto.sku)
      expect(result.currentStock).toBe(dto.currentStock)
      expect(result.minStockLevel).toBe(dto.minStockLevel)
      expect(result.unitCost.getValue()).toBe(15000) // 150.0 in cents
      expect(result.unitSalePrice.getValue()).toBe(25000) // 250.0 in cents
      expect(result.description).toBeUndefined()
      expect(result.supplier).toBeUndefined()
    })
  })

  describe('toResponseDtoArray', () => {
    it('should convert array of StockItem to array of StockItemResponseDto', () => {
      // Arrange
      const entities = [
        new StockItem(
          'stock-item-1',
          'Item 1',
          'ITM-001',
          10,
          5,
          Price.create('25.00'),
          Price.create('50.00'),
          'Description 1',
          'Supplier 1',
          new Date('2025-01-01T10:00:00Z'),
          new Date('2025-01-01T10:00:00Z'),
        ),
        new StockItem(
          'stock-item-2',
          'Item 2',
          'ITM-002',
          20,
          8,
          Price.create('40.00'),
          Price.create('80.00'),
          'Description 2',
          'Supplier 2',
          new Date('2025-01-02T10:00:00Z'),
          new Date('2025-01-02T10:00:00Z'),
        ),
      ]

      // Act
      const result = StockItemMapper.toResponseDtoArray(entities)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual<StockItemResponseDto>({
        id: 'stock-item-1',
        name: 'Item 1',
        sku: 'ITM-001',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: 'R$\u00A025,00',
        unitSalePrice: 'R$\u00A050,00',
        description: 'Description 1',
        supplier: 'Supplier 1',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      })
      expect(result[1]).toEqual<StockItemResponseDto>({
        id: 'stock-item-2',
        name: 'Item 2',
        sku: 'ITM-002',
        currentStock: 20,
        minStockLevel: 8,
        unitCost: 'R$\u00A040,00',
        unitSalePrice: 'R$\u00A080,00',
        description: 'Description 2',
        supplier: 'Supplier 2',
        createdAt: new Date('2025-01-02T10:00:00Z'),
        updatedAt: new Date('2025-01-02T10:00:00Z'),
      })
    })

    it('should return empty array when given empty array', () => {
      // Arrange
      const entities: StockItem[] = []

      // Act
      const result = StockItemMapper.toResponseDtoArray(entities)

      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })

  describe('fromUpdateDto', () => {
    it('should update StockItem with all provided fields from UpdateStockItemDto', () => {
      // Arrange
      const existingEntity = new StockItem(
        'stock-item-existing',
        'Original Name',
        'ORG-001',
        15,
        5,
        Price.create('30.00'),
        Price.create('60.00'),
        'Original Description',
        'Original Supplier',
        new Date('2025-01-01T10:00:00Z'),
        new Date('2025-01-01T10:00:00Z'),
      )

      const originalTimestamp = existingEntity.updatedAt.getTime()

      const updateDto: UpdateStockItemDto = {
        name: 'Updated Name',
        description: 'Updated Description',
        currentStock: 25,
        minStockLevel: 8,
        unitCost: '35.00',
        unitSalePrice: '70.00',
        supplier: 'Updated Supplier',
      }

      // Act
      const result = StockItemMapper.fromUpdateDto(updateDto, existingEntity)

      // Assert
      expect(result).toBeInstanceOf(StockItem)
      expect(result.id).toBe(existingEntity.id)
      expect(result.sku).toBe(existingEntity.sku) // SKU should not change
      expect(result.createdAt).toBe(existingEntity.createdAt) // createdAt should not change
      expect(result.name).toBe(updateDto.name)
      expect(result.description).toBe(updateDto.description)
      expect(result.currentStock).toBe(updateDto.currentStock)
      expect(result.minStockLevel).toBe(updateDto.minStockLevel)
      expect(result.unitCost.getValue()).toBe(3500) // 35.0 in cents
      expect(result.unitSalePrice.getValue()).toBe(7000) // 70.0 in cents
      expect(result.supplier).toBe(updateDto.supplier)
      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(originalTimestamp)
    })

    it('should keep existing values when UpdateStockItemDto fields are undefined', () => {
      // Arrange
      const existingEntity = new StockItem(
        'stock-item-existing',
        'Original Name',
        'ORG-001',
        15,
        5,
        Price.create('30.00'),
        Price.create('60.00'),
        'Original Description',
        'Original Supplier',
        new Date('2025-01-01T10:00:00Z'),
        new Date('2025-01-01T10:00:00Z'),
      )

      const updateDto: UpdateStockItemDto = {
        name: 'Updated Name',
        // Other fields are undefined, should keep original values
      }

      // Act
      const result = StockItemMapper.fromUpdateDto(updateDto, existingEntity)

      // Assert
      expect(result.name).toBe(updateDto.name)
      expect(result.description).toBe(existingEntity.description)
      expect(result.currentStock).toBe(existingEntity.currentStock)
      expect(result.minStockLevel).toBe(existingEntity.minStockLevel)
      expect(result.unitCost.getValue()).toBe(existingEntity.unitCost.getValue())
      expect(result.unitSalePrice.getValue()).toBe(existingEntity.unitSalePrice.getValue())
      expect(result.supplier).toBe(existingEntity.supplier)
    })

    it('should handle partial updates correctly', () => {
      // Arrange
      const existingEntity = new StockItem(
        'stock-item-partial',
        'Spark Plug',
        'SPK-001',
        50,
        10,
        Price.create('15.00'),
        Price.create('30.00'),
        'High performance spark plug',
        'NGK',
        new Date('2025-01-01T10:00:00Z'),
        new Date('2025-01-01T10:00:00Z'),
      )

      const updateDto: UpdateStockItemDto = {
        currentStock: 75,
        unitSalePrice: '35.00',
      }

      // Act
      const result = StockItemMapper.fromUpdateDto(updateDto, existingEntity)

      // Assert
      expect(result.name).toBe(existingEntity.name)
      expect(result.description).toBe(existingEntity.description)
      expect(result.currentStock).toBe(updateDto.currentStock)
      expect(result.minStockLevel).toBe(existingEntity.minStockLevel)
      expect(result.unitCost.getValue()).toBe(existingEntity.unitCost.getValue())
      expect(result.unitSalePrice.getValue()).toBe(3500) // 35.0 in cents
      expect(result.supplier).toBe(existingEntity.supplier)
    })
  })
})
