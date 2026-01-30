import { BudgetStatus, DeliveryMethod } from '@prisma/client'

import { Budget } from '@domain/budget/entities'

/**
 * Factory for creating Budget entities for testing
 */
export class BudgetFactory {
  /**
   * Create a valid Budget entity with sensible defaults
   */
  public static create(overrides: Partial<Budget> = {}): Budget {
    if (Object.keys(overrides).length === 0) {
      return Budget.create(
        'service-order-id',
        'client-id',
        7,
        DeliveryMethod.EMAIL,
        'Test budget',
        BudgetStatus.GENERATED,
        1000,
      )
    }
    const now = new Date()
    return new Budget(
      overrides.id ?? 'budget-id',
      overrides.status ?? BudgetStatus.GENERATED,
      overrides.totalAmount ??
        Budget.create(
          'service-order-id',
          'client-id',
          7,
          DeliveryMethod.EMAIL,
          'Test budget',
          BudgetStatus.GENERATED,
          1000,
        ).totalAmount,
      overrides.validityPeriod ?? 7,
      overrides.generationDate ?? now,
      overrides.serviceOrderId ?? 'service-order-id',
      overrides.clientId ?? 'client-id',
      overrides.sentDate,
      overrides.approvalDate,
      overrides.rejectionDate,
      overrides.deliveryMethod ?? DeliveryMethod.EMAIL,
      overrides.notes ?? 'Test budget',
      overrides.createdAt ?? now,
      overrides.updatedAt ?? now,
    )
  }

  /**
   * Create a minimal Budget entity (only required fields)
   */
  public static createMinimal(overrides: Partial<Budget> = {}): Budget {
    let totalAmount: string | number | undefined = undefined
    if (overrides.totalAmount !== undefined) {
      if (
        typeof overrides.totalAmount === 'object' &&
        overrides.totalAmount !== null &&
        typeof (overrides.totalAmount as any).getValue === 'function'
      ) {
        totalAmount = (overrides.totalAmount as any).getValue()
      } else {
        totalAmount = overrides.totalAmount as unknown as string | number
      }
    }
    return Budget.create(
      overrides.serviceOrderId ?? 'service-order-id',
      overrides.clientId ?? 'client-id',
      overrides.validityPeriod ?? 7,
      overrides.deliveryMethod ?? DeliveryMethod.EMAIL,
      overrides.notes,
      overrides.status ?? BudgetStatus.GENERATED,
      totalAmount ?? 1000,
    )
  }
}
