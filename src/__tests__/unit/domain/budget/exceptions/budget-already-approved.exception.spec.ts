import { BudgetAlreadyApprovedException } from '@domain/budget/exceptions'
import { DomainException } from '@shared'

describe('BudgetAlreadyApprovedException', () => {
  describe('constructor', () => {
    it('should extend DomainException', () => {
      const exception = new BudgetAlreadyApprovedException('budget-123')

      expect(exception).toBeInstanceOf(BudgetAlreadyApprovedException)
      expect(exception).toBeInstanceOf(DomainException)
      expect(exception).toBeInstanceOf(Error)
    })

    it('should create exception with correct message format', () => {
      const budgetId = 'budget-456'
      const exception = new BudgetAlreadyApprovedException(budgetId)

      expect(exception.message).toBe(`Budget with id ${budgetId} is already approved.`)
      expect(exception.message).toContain('budget-456')
      expect(exception.message).toContain('is already approved')
    })

    it('should set exception name to BudgetAlreadyApprovedException', () => {
      const exception = new BudgetAlreadyApprovedException('budget-789')
      expect(exception.name).toBe('BudgetAlreadyApprovedException')
    })

    it('should handle empty budget ID', () => {
      const exception = new BudgetAlreadyApprovedException('')

      expect(exception.message).toBe('Budget with id  is already approved.')
    })
  })

  describe('message formatting', () => {
    it('should format message correctly for different budget IDs', () => {
      const testCases = [
        { budgetId: 'budget-001', expected: 'Budget with id budget-001 is already approved.' },
        { budgetId: 'short', expected: 'Budget with id short is already approved.' },
        {
          budgetId: 'very-long-budget-id',
          expected: 'Budget with id very-long-budget-id is already approved.',
        },
      ]

      testCases.forEach(({ budgetId, expected }) => {
        const exception = new BudgetAlreadyApprovedException(budgetId)
        expect(exception.message).toBe(expected)
      })
    })

    it('should handle special characters in budget ID', () => {
      const exception = new BudgetAlreadyApprovedException('budget-special_@#$%')
      expect(exception.message).toBe('Budget with id budget-special_@#$% is already approved.')
    })

    it('should handle numeric budget ID', () => {
      const exception = new BudgetAlreadyApprovedException('12345')
      expect(exception.message).toBe('Budget with id 12345 is already approved.')
    })

    it('should handle UUID-like budget ID', () => {
      const exception = new BudgetAlreadyApprovedException('550e8400-e29b-41d4-a716-446655440000')
      expect(exception.message).toBe(
        'Budget with id 550e8400-e29b-41d4-a716-446655440000 is already approved.',
      )
    })
  })

  describe('inheritance and behavior', () => {
    it('should have correct prototype chain', () => {
      const exception = new BudgetAlreadyApprovedException('budget-prototype')

      expect(Object.getPrototypeOf(exception)).toBe(BudgetAlreadyApprovedException.prototype)
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(
        DomainException.prototype,
      )
      expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(exception)))).toBe(
        Error.prototype,
      )
    })

    it('should be catchable as DomainException', () => {
      const exception = new BudgetAlreadyApprovedException('budget-catch-test')

      try {
        throw exception
      } catch (error) {
        expect(error instanceof BudgetAlreadyApprovedException).toBe(true)
        expect(error instanceof DomainException).toBe(true)
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should preserve stack trace', () => {
      const exception = new BudgetAlreadyApprovedException('budget-stack')
      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('BudgetAlreadyApprovedException')
    })
  })

  describe('use case scenarios', () => {
    it('should create exception when trying to approve already approved budget', () => {
      const exception = new BudgetAlreadyApprovedException('budget-double-approval')

      expect(exception.message).toContain('is already approved')
      expect(exception.message).toContain('budget-double-approval')
    })

    it('should create exception for duplicate approval attempts', () => {
      const exception = new BudgetAlreadyApprovedException('budget-duplicate-approval')

      expect(exception.message).toContain('is already approved')
    })

    it('should create exception for status validation violations', () => {
      const exception = new BudgetAlreadyApprovedException('budget-status-violation')

      expect(exception.message).toContain('budget-status-violation')
      expect(exception.message).toContain('is already approved')
    })

    it('should be suitable for business rule enforcement', () => {
      const exception = new BudgetAlreadyApprovedException('budget-business-rule')

      expect(exception).toBeInstanceOf(DomainException)
      expect(exception.message).toMatch(/Budget with id .+ is already approved\./)
    })
  })

  describe('comparison with similar exceptions', () => {
    it('should have different message pattern than other budget exceptions', () => {
      const exception = new BudgetAlreadyApprovedException('budget-compare')

      expect(exception.message).toContain('is already approved')
      expect(exception.message).not.toContain('not found')
      expect(exception.message).not.toContain('invalid')
      expect(exception.message).not.toContain('mismatch')
      expect(exception.message).not.toContain('expired')
      expect(exception.message).not.toContain('rejected')
    })

    it('should be specific to budget approval state', () => {
      const exception = new BudgetAlreadyApprovedException('budget-specific')

      expect(exception.message).toMatch(/Budget with id .+ is already approved\./)
      expect(exception.message.endsWith('is already approved.')).toBe(true)
    })

    it('should focus on approval state conflict', () => {
      const exception = new BudgetAlreadyApprovedException('budget-conflict')

      expect(exception.message).toContain('already approved')
      expect(exception.message.toLowerCase()).toContain('already')
      expect(exception.message.toLowerCase()).toContain('approved')
    })

    it('should have clear and specific message about approval status', () => {
      const exception = new BudgetAlreadyApprovedException('budget-clear')

      // Simple, direct message about approval state
      expect(exception.message).toMatch(/^Budget with id .+ is already approved\.$/)
      expect(exception.message.toLowerCase()).toContain('already')
      expect(exception.message.toLowerCase()).toContain('approved')
    })
  })
})
