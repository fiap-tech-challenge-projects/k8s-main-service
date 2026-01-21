import { ServiceExecutionStatus } from '@domain/service-executions/enums'
import { InvalidStatusTransitionException } from '@domain/service-executions/exceptions'
import { ServiceExecutionStatusValidator } from '@domain/service-executions/validators'

describe('ServiceExecutionStatusValidator', () => {
  describe('validateTransition / isValidTransition / getAllowedTransitions', () => {
    it('allows ASSIGNED -> IN_PROGRESS', () => {
      expect(() =>
        ServiceExecutionStatusValidator.validateTransition(
          ServiceExecutionStatus.ASSIGNED,
          ServiceExecutionStatus.IN_PROGRESS,
        ),
      ).not.toThrow()
      expect(
        ServiceExecutionStatusValidator.isValidTransition(
          ServiceExecutionStatus.ASSIGNED,
          ServiceExecutionStatus.IN_PROGRESS,
        ),
      ).toBe(true)
    })

    it('disallows ASSIGNED -> COMPLETED', () => {
      expect(() =>
        ServiceExecutionStatusValidator.validateTransition(
          ServiceExecutionStatus.ASSIGNED,
          ServiceExecutionStatus.COMPLETED,
        ),
      ).toThrow(InvalidStatusTransitionException)
      expect(
        ServiceExecutionStatusValidator.isValidTransition(
          ServiceExecutionStatus.ASSIGNED,
          ServiceExecutionStatus.COMPLETED,
        ),
      ).toBe(false)
    })

    it('returns allowed transitions array', () => {
      const allowed = ServiceExecutionStatusValidator.getAllowedTransitions(
        ServiceExecutionStatus.IN_PROGRESS,
      )
      expect(Array.isArray(allowed)).toBe(true)
    })
  })
})
