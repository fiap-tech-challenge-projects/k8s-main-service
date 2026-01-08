import { BudgetExpiredException } from '@domain/budget/exceptions'
import { DomainException } from '@shared'

describe('BudgetExpiredException', () => {
  describe('constructor', () => {
    it('should extend DomainException', () => {
      const exception = new BudgetExpiredException('budget-123', new Date())

      expect(exception).toBeInstanceOf(BudgetExpiredException)
      expect(exception).toBeInstanceOf(DomainException)
      expect(exception).toBeInstanceOf(Error)
    })

    it('should create exception with correct message format', () => {
      const budgetId = 'budget-456'
      const date = new Date()
      const exception = new BudgetExpiredException(budgetId, date)
      expect(exception.message).toBe(
        `Budget with id ${budgetId} has expired on ${date.toISOString()}.`,
      )
      expect(exception.message).toContain('budget-456')
      expect(exception.message).toContain('has expired on')
    })

    it('should set exception name to BudgetExpiredException', () => {
      const exception = new BudgetExpiredException('budget-789', new Date())
      expect(exception.name).toBe('BudgetExpiredException')
    })

    it('should handle empty budget ID', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('', date)
      expect(exception.message).toBe(`Budget with id  has expired on ${date.toISOString()}.`)
    })
  })

  describe('message formatting', () => {
    it('should format message correctly for different budget IDs', () => {
      const date = new Date()
      const testCases = [
        {
          budgetId: 'budget-001',
          expected: `Budget with id budget-001 has expired on ${date.toISOString()}.`,
        },
        {
          budgetId: 'short',
          expected: `Budget with id short has expired on ${date.toISOString()}.`,
        },
        {
          budgetId: 'very-long-budget-id',
          expected: `Budget with id very-long-budget-id has expired on ${date.toISOString()}.`,
        },
      ]

      testCases.forEach(({ budgetId, expected }) => {
        const exception = new BudgetExpiredException(budgetId, date)
        expect(exception.message).toBe(expected)
      })
    })

    it('should handle special characters in budget ID', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-special_@#$%', date)
      expect(exception.message).toBe(
        `Budget with id budget-special_@#$% has expired on ${date.toISOString()}.`,
      )
    })

    it('should handle numeric budget ID', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('12345', date)
      expect(exception.message).toBe(`Budget with id 12345 has expired on ${date.toISOString()}.`)
    })

    it('should handle UUID-like budget ID', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('550e8400-e29b-41d4-a716-446655440000', date)
      expect(exception.message).toBe(
        `Budget with id 550e8400-e29b-41d4-a716-446655440000 has expired on ${date.toISOString()}.`,
      )
    })
  })

  describe('inheritance and behavior', () => {
    it('should have correct prototype chain', () => {
      const exception = new BudgetExpiredException('budget-prototype', new Date())
      expect(Object.getPrototypeOf(exception)).toBe(BudgetExpiredException.prototype)
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(
        DomainException.prototype,
      )
      expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(exception)))).toBe(
        Error.prototype,
      )
    })

    it('should be catchable as DomainException', () => {
      const exception = new BudgetExpiredException('budget-catch-test', new Date())
      try {
        throw exception
      } catch (error) {
        expect(error instanceof BudgetExpiredException).toBe(true)
        expect(error instanceof DomainException).toBe(true)
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should preserve stack trace', () => {
      const exception = new BudgetExpiredException('budget-stack', new Date())
      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('BudgetExpiredException')
    })
  })

  describe('use case scenarios', () => {
    it('should create exception for expired budget validation', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-past-validity', date)
      expect(exception.message).toContain('has expired on')
      expect(exception.message).toContain('budget-past-validity')
    })

    it('should create exception when budget validity period has passed', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-validity-passed', date)
      expect(exception.message).toContain('has expired on')
    })

    it('should create exception for time-sensitive operations', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-time-sensitive', date)
      expect(exception.message).toContain('budget-time-sensitive')
      expect(exception.message).toContain('has expired on')
    })

    it('should be suitable for business rule violations related to time', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-business-rule', date)
      expect(exception).toBeInstanceOf(DomainException)
      expect(exception.message).toMatch(/Budget with id .+ has expired on .+\./)
    })
  })

  describe('comparison with similar exceptions', () => {
    it('should have different message pattern than other budget exceptions', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-compare', date)
      expect(exception.message).toContain('has expired on')
      expect(exception.message).not.toContain('not found')
      expect(exception.message).not.toContain('invalid')
      expect(exception.message).not.toContain('mismatch')
      expect(exception.message).not.toContain('approved')
      expect(exception.message).not.toContain('rejected')
    })

    it('should be specific to budget expiration', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-specific', date)
      expect(exception.message).toMatch(/Budget with id .+ has expired on .+\./)
      expect(exception.message.endsWith(`has expired on ${date.toISOString()}.`)).toBe(true)
    })

    it('should have concise and clear message', () => {
      const date = new Date()
      const exception = new BudgetExpiredException('budget-clear', date)
      // Simple, direct message about expiration
      expect(exception.message.split(' ').length).toBe(8) // "Budget with id budget-clear has expired on <date>."
      expect(exception.message).toMatch(/^Budget with id .+ has expired on .+\.$/)
    })
  })
})
