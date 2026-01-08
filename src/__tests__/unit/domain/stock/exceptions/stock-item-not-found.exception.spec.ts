import { StockItemNotFoundException } from '@domain/stock/exceptions'
import { EntityNotFoundException } from '@shared'

describe('StockItemNotFoundException', () => {
  describe('constructor', () => {
    it('should create exception with correct message for valid stock item ID', () => {
      // Arrange
      const stockItemId = 'stock-item-123'

      // Act
      const exception = new StockItemNotFoundException(stockItemId)

      // Assert
      expect(exception).toBeInstanceOf(StockItemNotFoundException)
      expect(exception).toBeInstanceOf(EntityNotFoundException)
      expect(exception).toBeInstanceOf(Error)
      expect(exception.message).toBe("StockItem with id 'stock-item-123' not found")
      expect(exception.name).toBe('StockItemNotFoundException')
    })

    it('should create exception with correct message for UUID stock item ID', () => {
      // Arrange
      const stockItemId = '550e8400-e29b-41d4-a716-446655440000'

      // Act
      const exception = new StockItemNotFoundException(stockItemId)

      // Assert
      expect(exception.message).toBe(
        "StockItem with id '550e8400-e29b-41d4-a716-446655440000' not found",
      )
      expect(exception.name).toBe('StockItemNotFoundException')
    })

    it('should create exception with correct message for empty string ID', () => {
      // Arrange
      const stockItemId = ''

      // Act
      const exception = new StockItemNotFoundException(stockItemId)

      // Assert
      expect(exception.message).toBe("StockItem with id '' not found")
      expect(exception.name).toBe('StockItemNotFoundException')
    })

    it('should create exception with correct message for special characters in ID', () => {
      // Arrange
      const stockItemId = 'stock-item-123!@#$%'

      // Act
      const exception = new StockItemNotFoundException(stockItemId)

      // Assert
      expect(exception.message).toBe("StockItem with id 'stock-item-123!@#$%' not found")
      expect(exception.name).toBe('StockItemNotFoundException')
    })

    it('should create exception with correct message for numeric string ID', () => {
      // Arrange
      const stockItemId = '12345'

      // Act
      const exception = new StockItemNotFoundException(stockItemId)

      // Assert
      expect(exception.message).toBe("StockItem with id '12345' not found")
      expect(exception.name).toBe('StockItemNotFoundException')
    })
  })

  describe('inheritance chain', () => {
    it('should properly inherit from EntityNotFoundException', () => {
      // Arrange
      const stockItemId = 'stock-item-456'
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(exception instanceof StockItemNotFoundException).toBe(true)
      expect(exception instanceof EntityNotFoundException).toBe(true)
      expect(exception instanceof Error).toBe(true)
    })

    it('should have correct prototype chain', () => {
      // Arrange
      const stockItemId = 'stock-item-789'
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(Object.getPrototypeOf(exception).constructor).toBe(StockItemNotFoundException)
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception)).constructor).toBe(
        EntityNotFoundException,
      )
    })
  })

  describe('error properties', () => {
    it('should have correct error name property', () => {
      // Arrange
      const stockItemId = 'stock-item-999'
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(exception.name).toBe('StockItemNotFoundException')
    })

    it('should have stack trace', () => {
      // Arrange
      const stockItemId = 'stock-item-stack'
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('StockItemNotFoundException')
    })

    it('should be throwable and catchable', () => {
      // Arrange
      const stockItemId = 'stock-item-throw'
      let caughtException: StockItemNotFoundException | null = null

      // Act
      try {
        throw new StockItemNotFoundException(stockItemId)
      } catch (error) {
        caughtException = error as StockItemNotFoundException
      }

      // Assert
      expect(caughtException).not.toBeNull()
      expect(caughtException).toBeInstanceOf(StockItemNotFoundException)
      expect(caughtException?.message).toBe("StockItem with id 'stock-item-throw' not found")
    })
  })

  describe('message formatting', () => {
    it('should format message correctly with single quotes around ID', () => {
      // Arrange
      const stockItemId = 'test-id'
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(exception.message).toBe("StockItem with id 'test-id' not found")
      expect(exception.message).toContain("'test-id'")
      expect(exception.message).toMatch(/^StockItem with id '.+' not found$/)
    })

    it('should handle IDs with quotes in the message', () => {
      // Arrange
      const stockItemId = "id-with-'quotes'"
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(exception.message).toBe("StockItem with id 'id-with-'quotes'' not found")
    })

    it('should preserve exact ID in message including whitespace', () => {
      // Arrange
      const stockItemId = ' id-with-spaces '
      const exception = new StockItemNotFoundException(stockItemId)

      // Act & Assert
      expect(exception.message).toBe("StockItem with id ' id-with-spaces ' not found")
    })
  })

  describe('consistent behavior with parent class', () => {
    it('should behave consistently with EntityNotFoundException', () => {
      // Arrange
      const stockItemId = 'consistency-test'
      const stockException = new StockItemNotFoundException(stockItemId)
      const entityException = new EntityNotFoundException('StockItem', stockItemId)

      // Act & Assert
      expect(stockException.message).toBe(entityException.message)
      expect(stockException.name).toBe('StockItemNotFoundException')
      expect(stockException instanceof EntityNotFoundException).toBe(true)
    })

    it('should call parent constructor correctly', () => {
      // Arrange
      const stockItemId = 'parent-constructor-test'

      // Act
      const exception = new StockItemNotFoundException(stockItemId)

      // Assert
      // Verify that the parent constructor was called with correct parameters
      expect(exception.message).toBe("StockItem with id 'parent-constructor-test' not found")
      expect(exception.name).toBe('StockItemNotFoundException')
    })
  })
})
