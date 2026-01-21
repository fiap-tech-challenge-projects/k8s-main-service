import { BudgetStatus } from '@prisma/client'

import {
  BudgetAlreadyApprovedException,
  BudgetAlreadyRejectedException,
  BudgetExpiredException,
  InvalidBudgetStatusException,
} from '../exceptions'

/**
 * Validator for budget status change business rules
 */
export class BudgetStatusChangeValidator {
  /**
   * Validates if a status transition is allowed
   * @param currentStatus - The current budget status
   * @param newStatus - The new status to transition to
   * @param budgetId - The budget ID for error messages
   * @throws InvalidBudgetStatusException if the transition is not allowed
   */
  public static validateStatusTransition(
    currentStatus: BudgetStatus,
    newStatus: BudgetStatus,
    budgetId: string,
  ): void {
    const allowedTransitions: Record<BudgetStatus, BudgetStatus[]> = {
      [BudgetStatus.GENERATED]: [BudgetStatus.SENT, BudgetStatus.EXPIRED],
      [BudgetStatus.SENT]: [
        BudgetStatus.RECEIVED,
        BudgetStatus.APPROVED,
        BudgetStatus.REJECTED,
        BudgetStatus.EXPIRED,
      ],
      [BudgetStatus.RECEIVED]: [BudgetStatus.APPROVED, BudgetStatus.REJECTED, BudgetStatus.EXPIRED],
      [BudgetStatus.APPROVED]: [BudgetStatus.EXPIRED],
      [BudgetStatus.REJECTED]: [BudgetStatus.EXPIRED],
      [BudgetStatus.EXPIRED]: [],
    }

    const allowedStatuses = allowedTransitions[currentStatus]
    if (!allowedStatuses.includes(newStatus)) {
      throw new InvalidBudgetStatusException(budgetId, currentStatus, newStatus)
    }
  }

  /**
   * Validates if a budget can be approved
   * @param currentStatus - The current budget status
   * @param budgetId - The budget ID for error messages
   * @throws InvalidBudgetStatusException if the budget cannot be approved
   */
  public static validateCanApprove(currentStatus: BudgetStatus, budgetId: string): void {
    const allowedStatuses: BudgetStatus[] = [BudgetStatus.SENT, BudgetStatus.RECEIVED]
    if (!allowedStatuses.includes(currentStatus)) {
      throw new InvalidBudgetStatusException(budgetId, currentStatus, BudgetStatus.APPROVED)
    }
  }

  /**
   * Validates if a budget can be rejected
   * @param currentStatus - The current budget status
   * @param budgetId - The budget ID for error messages
   * @throws InvalidBudgetStatusException if the budget cannot be rejected
   */
  public static validateCanReject(currentStatus: BudgetStatus, budgetId: string): void {
    const allowedStatuses: BudgetStatus[] = [BudgetStatus.SENT, BudgetStatus.RECEIVED]
    if (!allowedStatuses.includes(currentStatus)) {
      throw new InvalidBudgetStatusException(budgetId, currentStatus, BudgetStatus.REJECTED)
    }
  }

  /**
   * Validates if a budget can be sent
   * @param currentStatus - The current budget status
   * @param budgetId - The budget ID for error messages
   * @throws InvalidBudgetStatusException if the budget cannot be sent
   */
  public static validateCanSend(currentStatus: BudgetStatus, budgetId: string): void {
    if (currentStatus !== BudgetStatus.GENERATED) {
      throw new InvalidBudgetStatusException(budgetId, currentStatus, BudgetStatus.SENT)
    }
  }

  /**
   * Validates if a budget can be marked as received
   * @param currentStatus - The current budget status
   * @param budgetId - The budget ID for error messages
   * @throws InvalidBudgetStatusException if the budget cannot be marked as received
   */
  public static validateCanMarkAsReceived(currentStatus: BudgetStatus, budgetId: string): void {
    if (currentStatus !== BudgetStatus.SENT) {
      throw new InvalidBudgetStatusException(budgetId, currentStatus, BudgetStatus.RECEIVED)
    }
  }

  /**
   * Validates if a budget can be approved (checks if already approved and not expired)
   * @param currentStatus - The current budget status
   * @param budgetId - The budget ID for error messages
   * @param isExpired - Whether the budget is expired
   * @param expirationDate - The expiration date for error messages
   * @throws BudgetAlreadyApprovedException if already approved
   * @throws BudgetExpiredException if budget is expired
   */
  public static validateApproval(
    currentStatus: BudgetStatus,
    budgetId: string,
    isExpired: boolean,
    expirationDate: Date,
  ): void {
    if (currentStatus === BudgetStatus.APPROVED) {
      throw new BudgetAlreadyApprovedException(budgetId)
    }

    if (isExpired) {
      throw new BudgetExpiredException(budgetId, expirationDate)
    }
  }

  /**
   * Validates if a budget can be rejected (checks if already rejected and not expired)
   * @param currentStatus - The current budget status
   * @param budgetId - The budget ID for error messages
   * @param isExpired - Whether the budget is expired
   * @param expirationDate - The expiration date for error messages
   * @throws BudgetAlreadyRejectedException if already rejected
   * @throws BudgetExpiredException if budget is expired
   */
  public static validateRejection(
    currentStatus: BudgetStatus,
    budgetId: string,
    isExpired: boolean,
    expirationDate: Date,
  ): void {
    if (currentStatus === BudgetStatus.REJECTED) {
      throw new BudgetAlreadyRejectedException(budgetId)
    }

    if (isExpired) {
      throw new BudgetExpiredException(budgetId, expirationDate)
    }
  }
}
