import { BudgetTotalMismatchException } from '@domain/budget/exceptions'
import { DomainException } from '@shared'

describe('BudgetTotalMismatchException', () => {
  describe('constructor', () => {
    it('should extend DomainException', () => {
      const exception = new BudgetTotalMismatchException('budget-123', 1000, 900)

      expect(exception).toBeInstanceOf(BudgetTotalMismatchException)
      expect(exception).toBeInstanceOf(DomainException)
      expect(exception).toBeInstanceOf(Error)
    })

    it('should create exception with correct message format', () => {
      const budgetId = 'budget-456'
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException(budgetId, declared, calculated)
      expect(exception.message).toBe(
        `Budget with id ${budgetId} has a total mismatch: declared ${declared} but calculated ${calculated}.`,
      )
      expect(exception.message).toContain('budget-456')
      expect(exception.message).toContain('total mismatch')
      expect(exception.message).toContain('declared 1000 but calculated 900')
    })

    it('should set exception name to BudgetTotalMismatchException', () => {
      const exception = new BudgetTotalMismatchException('budget-789', 1000, 900)
      expect(exception.name).toBe('BudgetTotalMismatchException')
    })

    it('should handle empty budget ID', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException('', declared, calculated)
      expect(exception.message).toBe(
        `Budget with id  has a total mismatch: declared ${declared} but calculated ${calculated}.`,
      )
    })
  })

  describe('message formatting', () => {
    it('should format message correctly for different budget IDs', () => {
      const testCases = [
        {
          budgetId: 'budget-001',
          expected:
            'Budget with id budget-001 has a total mismatch between declared and calculated values.',
        },
        {
          budgetId: 'short',
          expected:
            'Budget with id short has a total mismatch between declared and calculated values.',
        },
        {
          budgetId: 'very-long-budget-id-with-many-characters',
          expected:
            'Budget with id very-long-budget-id-with-many-characters has a total mismatch between declared and calculated values.',
        },
      ]

      testCases.forEach(({ budgetId }) => {
        const declared = 1000
        const calculated = 900
        const exception = new BudgetTotalMismatchException(budgetId, declared, calculated)
        expect(exception.message).toBe(
          `Budget with id ${budgetId} has a total mismatch: declared ${declared} but calculated ${calculated}.`,
        )
      })
    })

    it('should handle special characters in budget ID', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException(
        'budget-special_@#$%^&*()',
        declared,
        calculated,
      )
      expect(exception.message).toBe(
        `Budget with id budget-special_@#$%^&*() has a total mismatch: declared ${declared} but calculated ${calculated}.`,
      )
    })

    it('should handle numeric budget ID', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException('12345', declared, calculated)
      expect(exception.message).toBe(
        `Budget with id 12345 has a total mismatch: declared ${declared} but calculated ${calculated}.`,
      )
    })

    it('should handle UUID-like budget ID', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException(
        '550e8400-e29b-41d4-a716-446655440000',
        declared,
        calculated,
      )
      expect(exception.message).toBe(
        `Budget with id 550e8400-e29b-41d4-a716-446655440000 has a total mismatch: declared ${declared} but calculated ${calculated}.`,
      )
    })
  })

  describe('inheritance and behavior', () => {
    it('should have correct prototype chain', () => {
      const exception = new BudgetTotalMismatchException('budget-prototype', 1000, 900)
      expect(Object.getPrototypeOf(exception)).toBe(BudgetTotalMismatchException.prototype)
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(
        DomainException.prototype,
      )
      expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(exception)))).toBe(
        Error.prototype,
      )
    })

    it('should be catchable as DomainException', () => {
      const exception = new BudgetTotalMismatchException('budget-catch-test', 1000, 900)
      try {
        throw exception
      } catch (error) {
        expect(error instanceof BudgetTotalMismatchException).toBe(true)
        expect(error instanceof DomainException).toBe(true)
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should preserve stack trace', () => {
      const exception = new BudgetTotalMismatchException('budget-stack', 1000, 900)
      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('BudgetTotalMismatchException')
    })
  })

  describe('use case scenarios', () => {
    it('should create exception when declared total is higher than calculated', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException(
        'budget-higher-declared',
        declared,
        calculated,
      )
      expect(exception.message).toContain('total mismatch: declared 1000 but calculated 900')
    })

    it('should create exception when declared total is lower than calculated', () => {
      const declared = 900
      const calculated = 1000
      const exception = new BudgetTotalMismatchException(
        'budget-lower-declared',
        declared,
        calculated,
      )
      expect(exception.message).toContain('total mismatch: declared 900 but calculated 1000')
    })

    it('should create exception for budget validation failure', () => {
      const exception = new BudgetTotalMismatchException('budget-validation-failed', 1000, 900)
      expect(exception.message).toContain('budget-validation-failed')
      expect(exception.message).toContain('total mismatch')
    })

    it('should be suitable for financial validation errors', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException(
        'budget-financial-error',
        declared,
        calculated,
      )
      // The message clearly indicates a financial calculation problem
      expect(exception.message).toContain('total mismatch: declared 1000 but calculated 900')
      expect(exception).toBeInstanceOf(DomainException)
    })
  })

  describe('comparison with similar exceptions', () => {
    it('should have different message pattern than generic domain exceptions', () => {
      const declared = 1000
      const calculated = 900
      const exception = new BudgetTotalMismatchException('budget-compare', declared, calculated)
      expect(exception.message).toContain('total mismatch: declared 1000 but calculated 900')
      expect(exception.message).not.toContain('not found')
      expect(exception.message).not.toContain('invalid')
    })

    it('should be specific to budget total validation', () => {
      const exception = new BudgetTotalMismatchException('budget-specific', 1000, 900)
      expect(exception.message).toMatch(/Budget with id .+ has a total mismatch/)
    })
  })
})
