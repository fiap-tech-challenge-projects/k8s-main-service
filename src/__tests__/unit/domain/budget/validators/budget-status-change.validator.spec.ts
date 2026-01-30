import { BudgetStatus } from '@prisma/client'

import {
  InvalidBudgetStatusException,
  BudgetAlreadyApprovedException,
  BudgetExpiredException,
  BudgetAlreadyRejectedException,
} from '@domain/budget/exceptions'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'

describe('BudgetStatusChangeValidator', () => {
  const id = 'budget-1'

  describe('validateStatusTransition', () => {
    it('allows GENERATED -> SENT', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateStatusTransition(
          BudgetStatus.GENERATED,
          BudgetStatus.SENT,
          id,
        ),
      ).not.toThrow()
    })

    it('disallows GENERATED -> APPROVED', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateStatusTransition(
          BudgetStatus.GENERATED,
          BudgetStatus.APPROVED,
          id,
        ),
      ).toThrow(InvalidBudgetStatusException)
    })
  })

  describe('validateCanApprove / validateApproval', () => {
    it('allows approval when status is SENT and not expired', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateCanApprove(BudgetStatus.SENT, id),
      ).not.toThrow()
      expect(() =>
        BudgetStatusChangeValidator.validateApproval(BudgetStatus.SENT, id, false, new Date()),
      ).not.toThrow()
    })

    it('throws when already approved', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateApproval(BudgetStatus.APPROVED, id, false, new Date()),
      ).toThrow(BudgetAlreadyApprovedException)
    })

    it('throws when expired', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateApproval(BudgetStatus.SENT, id, true, new Date()),
      ).toThrow(BudgetExpiredException)
    })
  })

  describe('validateCanReject / validateRejection', () => {
    it('allows rejection when status is RECEIVED', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateCanReject(BudgetStatus.RECEIVED, id),
      ).not.toThrow()
      expect(() =>
        BudgetStatusChangeValidator.validateRejection(BudgetStatus.RECEIVED, id, false, new Date()),
      ).not.toThrow()
    })

    it('throws when already rejected', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateRejection(BudgetStatus.REJECTED, id, false, new Date()),
      ).toThrow(BudgetAlreadyRejectedException)
    })

    it('throws when expired on rejection', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateRejection(BudgetStatus.SENT, id, true, new Date()),
      ).toThrow(BudgetExpiredException)
    })
  })

  describe('validateCanSend / validateCanMarkAsReceived', () => {
    it('allows send only from GENERATED', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateCanSend(BudgetStatus.GENERATED, id),
      ).not.toThrow()
      expect(() => BudgetStatusChangeValidator.validateCanSend(BudgetStatus.SENT, id)).toThrow(
        InvalidBudgetStatusException,
      )
    })

    it('allows mark as received only from SENT', () => {
      expect(() =>
        BudgetStatusChangeValidator.validateCanMarkAsReceived(BudgetStatus.SENT, id),
      ).not.toThrow()
      expect(() =>
        BudgetStatusChangeValidator.validateCanMarkAsReceived(BudgetStatus.GENERATED, id),
      ).toThrow(InvalidBudgetStatusException)
    })
  })
})
