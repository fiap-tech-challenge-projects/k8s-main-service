import { InvalidBudgetStatusException } from '@domain/budget/exceptions'
import { DomainException } from '@shared'

describe('InvalidBudgetStatusException', () => {
  describe('constructor', () => {
    it('should extend DomainException', () => {
      const exception = new InvalidBudgetStatusException(
        'budget-123',
        'GENERATED',
        'INVALID_STATUS',
      )

      expect(exception).toBeInstanceOf(InvalidBudgetStatusException)
      expect(exception).toBeInstanceOf(DomainException)
      expect(exception).toBeInstanceOf(Error)
    })

    it('should create exception with correct message format', () => {
      const budgetId = 'budget-456'
      const status = 'CANCELLED'
      const exception = new InvalidBudgetStatusException(budgetId, 'GENERATED', status)

      expect(exception.message).toBe(
        `Budget with id ${budgetId} cannot transition from status "GENERATED" to "${status}".`,
      )
      expect(exception.message).toContain('budget-456')
      expect(exception.message).toContain('CANCELLED')
    })

    it('should set default exception name from DomainException', () => {
      const exception = new InvalidBudgetStatusException('budget-789', 'GENERATED', 'UNKNOWN')

      expect(exception.name).toBe('InvalidBudgetStatusException')
    })

    it('should handle empty budget ID', () => {
      const exception = new InvalidBudgetStatusException('', 'GENERATED', 'APPROVED')

      expect(exception.message).toBe(
        'Budget with id  cannot transition from status "GENERATED" to "APPROVED".',
      )
    })

    it('should handle empty status', () => {
      const exception = new InvalidBudgetStatusException('budget-123', 'GENERATED', '')

      expect(exception.message).toBe(
        'Budget with id budget-123 cannot transition from status "GENERATED" to "".',
      )
    })
  })

  describe('message formatting', () => {
    it('should format message correctly for typical budget statuses', () => {
      const testCases = [
        {
          budgetId: 'budget-001',
          status: 'APPROVED',
          expected:
            'Budget with id budget-001 cannot transition from status "GENERATED" to "APPROVED".',
        },
        {
          budgetId: 'budget-002',
          status: 'REJECTED',
          expected:
            'Budget with id budget-002 cannot transition from status "GENERATED" to "REJECTED".',
        },
        {
          budgetId: 'budget-003',
          status: 'SENT',
          expected:
            'Budget with id budget-003 cannot transition from status "GENERATED" to "SENT".',
        },
        {
          budgetId: 'budget-004',
          status: 'GENERATED',
          expected:
            'Budget with id budget-004 cannot transition from status "GENERATED" to "GENERATED".',
        },
      ]

      testCases.forEach(({ budgetId, status, expected }) => {
        const exception = new InvalidBudgetStatusException(budgetId, 'GENERATED', status)
        expect(exception.message).toBe(expected)
      })
    })

    it('should handle special characters in budget ID and status', () => {
      const exception = new InvalidBudgetStatusException(
        'budget-special_@#$',
        'GENERATED',
        'STATUS_WITH_UNDERSCORE',
      )

      expect(exception.message).toBe(
        'Budget with id budget-special_@#$ cannot transition from status "GENERATED" to "STATUS_WITH_UNDERSCORE".',
      )
    })

    it('should handle numeric budget ID', () => {
      const exception = new InvalidBudgetStatusException('12345', 'GENERATED', 'APPROVED')

      expect(exception.message).toBe(
        'Budget with id 12345 cannot transition from status "GENERATED" to "APPROVED".',
      )
    })
  })

  describe('inheritance and behavior', () => {
    it('should have correct prototype chain', () => {
      const exception = new InvalidBudgetStatusException('budget-999', 'GENERATED', 'TEST_STATUS')

      expect(Object.getPrototypeOf(exception)).toBe(InvalidBudgetStatusException.prototype)
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(
        DomainException.prototype,
      )
      expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(exception)))).toBe(
        Error.prototype,
      )
    })

    it('should be catchable as DomainException', () => {
      const exception = new InvalidBudgetStatusException(
        'budget-catch-test',
        'GENERATED',
        'CATCH_STATUS',
      )

      try {
        throw exception
      } catch (error) {
        expect(error instanceof InvalidBudgetStatusException).toBe(true)
        expect(error instanceof DomainException).toBe(true)
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should preserve stack trace', () => {
      const exception = new InvalidBudgetStatusException(
        'budget-stack',
        'GENERATED',
        'STACK_STATUS',
      )

      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('InvalidBudgetStatusException')
    })
  })

  describe('use case scenarios', () => {
    it('should create exception for transition from APPROVED to GENERATED', () => {
      const exception = new InvalidBudgetStatusException('budget-approved', 'APPROVED', 'GENERATED')

      expect(exception.message).toContain('cannot transition from status "APPROVED" to "GENERATED"')
    })

    it('should create exception for transition from REJECTED to APPROVED', () => {
      const exception = new InvalidBudgetStatusException('budget-rejected', 'REJECTED', 'APPROVED')

      expect(exception.message).toContain('cannot transition from status "REJECTED" to "APPROVED"')
    })

    it('should create exception for invalid custom status', () => {
      const exception = new InvalidBudgetStatusException(
        'budget-custom',
        'GENERATED',
        'CUSTOM_INVALID_STATUS',
      )

      expect(exception.message).toContain(
        'cannot transition from status "GENERATED" to "CUSTOM_INVALID_STATUS"',
      )
    })
  })
})
