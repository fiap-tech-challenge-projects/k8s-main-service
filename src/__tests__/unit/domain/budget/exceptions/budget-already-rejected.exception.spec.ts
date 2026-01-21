import { BudgetAlreadyRejectedException } from '@domain/budget/exceptions'
import { DomainException } from '@shared'

describe('BudgetAlreadyRejectedException', () => {
  describe('constructor', () => {
    it('should extend DomainException', () => {
      const exception = new BudgetAlreadyRejectedException('budget-123')

      expect(exception).toBeInstanceOf(BudgetAlreadyRejectedException)
      expect(exception).toBeInstanceOf(DomainException)
      expect(exception).toBeInstanceOf(Error)
    })

    it('should create exception with correct message format', () => {
      const budgetId = 'budget-456'
      const exception = new BudgetAlreadyRejectedException(budgetId)

      expect(exception.message).toBe(`Budget with id ${budgetId} is already rejected.`)
      expect(exception.message).toContain('budget-456')
      expect(exception.message).toContain('is already rejected')
    })

    it('should set exception name to BudgetAlreadyRejectedException', () => {
      const exception = new BudgetAlreadyRejectedException('budget-789')
      expect(exception.name).toBe('BudgetAlreadyRejectedException')
    })

    it('should handle empty budget ID', () => {
      const exception = new BudgetAlreadyRejectedException('')

      expect(exception.message).toBe('Budget with id  is already rejected.')
    })
  })

  describe('message formatting', () => {
    it('should format message correctly for different budget IDs', () => {
      const testCases = [
        { budgetId: 'budget-001', expected: 'Budget with id budget-001 is already rejected.' },
        { budgetId: 'short', expected: 'Budget with id short is already rejected.' },
        {
          budgetId: 'very-long-budget-id',
          expected: 'Budget with id very-long-budget-id is already rejected.',
        },
      ]

      testCases.forEach(({ budgetId, expected }) => {
        const exception = new BudgetAlreadyRejectedException(budgetId)
        expect(exception.message).toBe(expected)
      })
    })

    it('should handle special characters in budget ID', () => {
      const exception = new BudgetAlreadyRejectedException('budget-special_@#$%')

      expect(exception.message).toBe('Budget with id budget-special_@#$% is already rejected.')
    })

    it('should handle numeric budget ID', () => {
      const exception = new BudgetAlreadyRejectedException('12345')

      expect(exception.message).toBe('Budget with id 12345 is already rejected.')
    })

    it('should handle UUID-like budget ID', () => {
      const exception = new BudgetAlreadyRejectedException('550e8400-e29b-41d4-a716-446655440000')

      expect(exception.message).toBe(
        'Budget with id 550e8400-e29b-41d4-a716-446655440000 is already rejected.',
      )
    })
  })

  describe('inheritance and behavior', () => {
    it('should have correct prototype chain', () => {
      const exception = new BudgetAlreadyRejectedException('budget-prototype')

      expect(Object.getPrototypeOf(exception)).toBe(BudgetAlreadyRejectedException.prototype)
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(
        DomainException.prototype,
      )
      expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(exception)))).toBe(
        Error.prototype,
      )
    })

    it('should be catchable as DomainException', () => {
      const exception = new BudgetAlreadyRejectedException('budget-catch-test')

      try {
        throw exception
      } catch (error) {
        expect(error instanceof BudgetAlreadyRejectedException).toBe(true)
        expect(error instanceof DomainException).toBe(true)
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should preserve stack trace', () => {
      const exception = new BudgetAlreadyRejectedException('budget-stack')
      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('BudgetAlreadyRejectedException')
    })
  })

  describe('use case scenarios', () => {
    it('should create exception when trying to reject already rejected budget', () => {
      const exception = new BudgetAlreadyRejectedException('budget-double-rejection')

      expect(exception.message).toContain('is already rejected')
      expect(exception.message).toContain('budget-double-rejection')
    })

    it('should create exception for duplicate rejection attempts', () => {
      const exception = new BudgetAlreadyRejectedException('budget-duplicate-rejection')

      expect(exception.message).toContain('is already rejected')
    })

    it('should create exception for status validation violations', () => {
      const exception = new BudgetAlreadyRejectedException('budget-status-violation')

      expect(exception.message).toContain('budget-status-violation')
      expect(exception.message).toContain('is already rejected')
    })

    it('should be suitable for business rule enforcement', () => {
      const exception = new BudgetAlreadyRejectedException('budget-business-rule')

      expect(exception).toBeInstanceOf(DomainException)
      expect(exception.message).toMatch(/Budget with id .+ is already rejected\./)
    })
  })

  describe('comparison with similar exceptions', () => {
    it('should have different message pattern than other budget exceptions', () => {
      const exception = new BudgetAlreadyRejectedException('budget-compare')

      expect(exception.message).toContain('is already rejected')
      expect(exception.message).not.toContain('not found')
      expect(exception.message).not.toContain('invalid')
      expect(exception.message).not.toContain('mismatch')
      expect(exception.message).not.toContain('expired')
      expect(exception.message).not.toContain('approved')
    })

    it('should be specific to budget rejection state', () => {
      const exception = new BudgetAlreadyRejectedException('budget-specific')

      expect(exception.message).toMatch(/Budget with id .+ is already rejected\./)
      expect(exception.message.endsWith('is already rejected.')).toBe(true)
    })

    it('should focus on rejection state conflict', () => {
      const exception = new BudgetAlreadyRejectedException('budget-conflict')

      expect(exception.message).toContain('already rejected')
      expect(exception.message.toLowerCase()).toContain('already')
      expect(exception.message.toLowerCase()).toContain('rejected')
    })

    it('should have clear and specific message about rejection status', () => {
      const exception = new BudgetAlreadyRejectedException('budget-clear')

      // Simple, direct message about rejection state
      expect(exception.message).toMatch(/^Budget with id .+ is already rejected\.$/)
      expect(exception.message.toLowerCase()).toContain('already')
      expect(exception.message.toLowerCase()).toContain('rejected')
    })

    it('should distinguish from approval exceptions', () => {
      const exception = new BudgetAlreadyRejectedException('budget-distinguish')

      expect(exception.message).toContain('rejected')
      expect(exception.message).not.toContain('approved')
      expect(exception.message).not.toContain('approve')
    })
  })
})
