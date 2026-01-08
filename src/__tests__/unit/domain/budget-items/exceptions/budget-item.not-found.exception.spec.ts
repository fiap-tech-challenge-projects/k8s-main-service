import { BudgetItemNotFoundException } from '@domain/budget-items/exceptions'
import { EntityNotFoundException } from '@shared'

describe('BudgetItemNotFoundException', () => {
  describe('constructor', () => {
    it('should create a budget item not found exception', () => {
      // Arrange
      const budgetItemId = 'budget-item-123'

      // Act
      const exception = new BudgetItemNotFoundException(budgetItemId)

      // Assert
      expect(exception).toBeInstanceOf(BudgetItemNotFoundException)
      expect(exception).toBeInstanceOf(EntityNotFoundException)
      expect(exception).toBeInstanceOf(Error)
    })

    it('should include the budget item ID in the message', () => {
      // Arrange
      const budgetItemId = 'test-budget-456'

      // Act
      const exception = new BudgetItemNotFoundException(budgetItemId)

      // Assert
      expect(exception.message).toContain(budgetItemId)
      expect(exception.message).toContain('Budget item')
      expect(exception.message).toContain('not found')
    })

    it('should have correct error name', () => {
      // Arrange
      const budgetItemId = 'test-id'

      // Act
      const exception = new BudgetItemNotFoundException(budgetItemId)

      // Assert
      expect(exception.name).toBe('BudgetItemNotFoundException')
    })
  })

  describe('inheritance', () => {
    it('should properly inherit from EntityNotFoundException', () => {
      // Arrange
      const budgetItemId = 'inheritance-test'

      // Act
      const exception = new BudgetItemNotFoundException(budgetItemId)

      // Assert
      expect(exception instanceof BudgetItemNotFoundException).toBe(true)
      expect(exception instanceof EntityNotFoundException).toBe(true)
      expect(exception instanceof Error).toBe(true)
    })
  })

  describe('error behavior', () => {
    it('should be throwable and catchable', () => {
      // Arrange
      const budgetItemId = 'throwable-test'
      let caughtException: BudgetItemNotFoundException | null = null

      // Act
      try {
        throw new BudgetItemNotFoundException(budgetItemId)
      } catch (error) {
        caughtException = error as BudgetItemNotFoundException
      }

      // Assert
      expect(caughtException).not.toBeNull()
      expect(caughtException).toBeInstanceOf(BudgetItemNotFoundException)
      expect(caughtException?.message).toContain(budgetItemId)
    })

    it('should have a stack trace', () => {
      // Arrange
      const budgetItemId = 'stack-test'

      // Act
      const exception = new BudgetItemNotFoundException(budgetItemId)

      // Assert
      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack?.length).toBeGreaterThan(0)
    })
  })

  describe('message content', () => {
    it('should work with different ID formats', () => {
      // Arrange
      const scenarios = [
        'simple-id',
        '12345',
        '550e8400-e29b-41d4-a716-446655440000',
        'budget_item_123',
      ]

      scenarios.forEach((budgetItemId) => {
        // Act
        const exception = new BudgetItemNotFoundException(budgetItemId)

        // Assert
        expect(exception.message).toContain(budgetItemId)
        expect(exception).toBeInstanceOf(BudgetItemNotFoundException)
      })
    })

    it('should handle empty string ID', () => {
      // Arrange
      const emptyId = ''

      // Act
      const exception = new BudgetItemNotFoundException(emptyId)

      // Assert
      expect(exception).toBeInstanceOf(BudgetItemNotFoundException)
      expect(exception.message).toContain('Budget item')
    })

    it('should contain meaningful error information', () => {
      // Arrange
      const budgetItemId = 'meaningful-test'

      // Act
      const exception = new BudgetItemNotFoundException(budgetItemId)

      // Assert
      expect(exception.message).toContain('Budget item')
      expect(exception.message).toContain(budgetItemId)
      expect(exception.message).toContain('not found')
      expect(exception.message.length).toBeGreaterThan(0)
    })
  })
})
