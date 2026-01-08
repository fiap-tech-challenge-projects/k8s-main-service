import { StockItem } from '@domain/stock/entities'

describe('StockItem', () => {
  const validStockItemParams = {
    name: 'Engine Oil 5W-30',
    sku: 'OIL-5W30-1L',
    currentStock: 50,
    minStockLevel: 10,
    unitCost: '25.50',
    unitSalePrice: '45.90',
    description: 'Synthetic engine oil for modern engines',
    supplier: 'Lubricants Inc',
  }

  describe('Creation', () => {
    it('should create a valid stock item with static create method', () => {
      // Act
      const stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
        validStockItemParams.description,
        validStockItemParams.supplier,
      )

      // Assert
      expect(stockItem.name).toBe(validStockItemParams.name)
      expect(stockItem.sku).toBe(validStockItemParams.sku)
      expect(stockItem.currentStock).toBe(validStockItemParams.currentStock)
      expect(stockItem.minStockLevel).toBe(validStockItemParams.minStockLevel)
      expect(stockItem.description).toBe(validStockItemParams.description)
      expect(stockItem.supplier).toBe(validStockItemParams.supplier)
      expect(stockItem.createdAt).toBeInstanceOf(Date)
      expect(stockItem.updatedAt).toBeInstanceOf(Date)
    })

    it('should create stock item without optional fields', () => {
      // Act
      const stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
      )

      // Assert
      expect(stockItem.description).toBeUndefined()
      expect(stockItem.supplier).toBeUndefined()
    })

    it('should throw error when creating with invalid name', () => {
      // Arrange
      const invalidName = 'A' // Too short

      // Act & Assert
      expect(() =>
        StockItem.create(
          invalidName,
          validStockItemParams.sku,
          validStockItemParams.currentStock,
          validStockItemParams.minStockLevel,
          validStockItemParams.unitCost,
          validStockItemParams.unitSalePrice,
        ),
      ).toThrow('Invalid stock item name')
    })

    it('should throw error when sale price is lower than cost', () => {
      // Arrange
      const unitCost = '50.00'
      const unitSalePrice = '40.00' // Lower than cost

      // Act & Assert
      expect(() =>
        StockItem.create(
          validStockItemParams.name,
          validStockItemParams.sku,
          validStockItemParams.currentStock,
          validStockItemParams.minStockLevel,
          unitCost,
          unitSalePrice,
        ),
      ).toThrow('Invalid price margin')
    })
  })

  describe('Stock Management', () => {
    let stockItem: StockItem

    beforeEach(() => {
      stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
      )
    })

    it('should adjust stock by positive quantity', () => {
      // Act
      stockItem.adjustStock(10)

      // Assert
      expect(stockItem.currentStock).toBe(60)
    })

    it('should adjust stock by negative quantity', () => {
      // Act
      stockItem.adjustStock(-10)

      // Assert
      expect(stockItem.currentStock).toBe(40)
    })

    it('should throw error when adjusting stock to negative', () => {
      // Act & Assert
      expect(() => stockItem.adjustStock(-60)).toThrow('Invalid stock adjustment')
    })

    it('should update current stock with valid value', () => {
      // Act
      stockItem.updateCurrentStock(100)

      // Assert
      expect(stockItem.currentStock).toBe(100)
    })

    it('should throw error when updating current stock with negative value', () => {
      // Act & Assert
      expect(() => stockItem.updateCurrentStock(-5)).toThrow('Invalid current stock')
    })
  })

  describe('Price Management', () => {
    let stockItem: StockItem

    beforeEach(() => {
      stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
      )
    })

    it('should update unit cost with valid value', () => {
      // Act
      stockItem.updateUnitCost('30.00')

      // Assert
      expect(stockItem.unitCost.getReaisValue()).toBe(30.0)
    })

    it('should update unit sale price with valid value', () => {
      // Act
      stockItem.updateUnitSalePrice('50.00')

      // Assert
      expect(stockItem.unitSalePrice.getReaisValue()).toBe(50.0)
    })

    it('should throw error when updating sale price below cost', () => {
      // Act & Assert
      expect(() => stockItem.updateUnitSalePrice('20.00')).toThrow('Invalid price margin')
    })

    it('should allow updating cost when sale price still covers it', () => {
      // Act
      stockItem.updateUnitCost('20.00') // Cost decreases, sale price still covers

      // Assert
      expect(stockItem.unitCost.getReaisValue()).toBe(20.0)
    })
  })

  describe('Business Logic', () => {
    let stockItem: StockItem

    beforeEach(() => {
      stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        15, // currentStock
        10, // minStockLevel
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
      )
    })

    it('should check if has specific SKU', () => {
      // Act & Assert
      expect(stockItem.hasSku('OIL-5W30-1L')).toBe(true)
      expect(stockItem.hasSku('INVALID-SKU')).toBe(false)
    })

    it('should check if has sufficient stock', () => {
      // Act & Assert
      expect(stockItem.hasStock(10)).toBe(true)
      expect(stockItem.hasStock(20)).toBe(false)
    })

    it('should check if below minimum stock level', () => {
      // Arrange
      const lowStockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        5, // Below minimum
        10,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
      )

      // Act & Assert
      expect(lowStockItem.isBelowMinimumStock()).toBe(true)
      expect(stockItem.isBelowMinimumStock()).toBe(false)
    })

    it('should calculate stock deficit', () => {
      // Arrange
      const lowStockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        5, // Below minimum of 10
        10,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
      )

      // Act & Assert
      expect(lowStockItem.getStockDeficit()).toBe(5)
      expect(stockItem.getStockDeficit()).toBe(0)
    })

    it('should calculate profit margin percentage', () => {
      // Arrange
      const cost = 25.5
      const salePrice = 45.9
      const expectedMargin = ((salePrice - cost) / cost) * 100

      // Act
      const margin = stockItem.getProfitMarginPercentage()

      // Assert
      expect(margin).toBeCloseTo(expectedMargin, 2)
    })

    it('should calculate profit per unit', () => {
      // Arrange
      const cost = 25.5
      const salePrice = 45.9
      const expectedProfit = salePrice - cost

      // Act
      const profit = stockItem.getProfitPerUnit()

      // Assert
      // profit is returned in cents by the entity; convert to reais for comparison
      expect(profit / 100).toBeCloseTo(expectedProfit, 2)
    })

    it('should return zero profit margin when cost is zero', () => {
      // Arrange
      const zeroCostItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        '0.00', // Zero cost
        validStockItemParams.unitSalePrice,
      )

      // Act
      const margin = zeroCostItem.getProfitMarginPercentage()

      // Assert
      expect(margin).toBe(0)
    })
  })

  describe('Formatted Prices', () => {
    it('should return formatted unit cost', () => {
      // Arrange
      const stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        '25.50',
        validStockItemParams.unitSalePrice,
      )

      // Act
      const formattedCost = stockItem.getFormattedUnitCost()

      // Assert
      expect(formattedCost).toMatch(/R\$\s*\d+[,.]\d{2}/) // Brazilian Real format
    })

    it('should return formatted unit sale price', () => {
      // Arrange
      const stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        validStockItemParams.unitCost,
        '45.90',
      )

      // Act
      const formattedPrice = stockItem.getFormattedUnitSalePrice()

      // Assert
      expect(formattedPrice).toMatch(/R\$\s*\d+[,.]\d{2}/) // Brazilian Real format
    })
  })

  describe('Validation Updates', () => {
    let stockItem: StockItem

    beforeEach(() => {
      stockItem = StockItem.create(
        validStockItemParams.name,
        validStockItemParams.sku,
        validStockItemParams.currentStock,
        validStockItemParams.minStockLevel,
        validStockItemParams.unitCost,
        validStockItemParams.unitSalePrice,
        validStockItemParams.description,
        validStockItemParams.supplier,
      )
    })

    it('should update name with valid value', () => {
      // Act
      stockItem.updateName('New Engine Oil Name')

      // Assert
      expect(stockItem.name).toBe('New Engine Oil Name')
    })

    it('should throw error when updating name with invalid value', () => {
      // Act & Assert
      expect(() => stockItem.updateName('A')).toThrow('Invalid stock item name')
    })

    it('should update description with valid value', () => {
      // Act
      stockItem.updateDescription('New description')

      // Assert
      expect(stockItem.description).toBe('New description')
    })

    it('should update description to undefined', () => {
      // Act
      stockItem.updateDescription(undefined)

      // Assert
      expect(stockItem.description).toBeUndefined()
    })

    it('should throw error when updating description with too long value', () => {
      // Arrange
      const longDescription = 'A'.repeat(501)

      // Act & Assert
      expect(() => stockItem.updateDescription(longDescription)).toThrow('Invalid description')
    })

    it('should update supplier with valid value', () => {
      // Act
      stockItem.updateSupplier('New Supplier Ltd')

      // Assert
      expect(stockItem.supplier).toBe('New Supplier Ltd')
    })
  })
})
