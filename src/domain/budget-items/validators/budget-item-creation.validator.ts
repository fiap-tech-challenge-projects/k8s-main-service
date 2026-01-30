import { ServiceOrderStatus } from '@prisma/client'

import { InvalidServiceOrderStatusForBudgetItemException } from '@domain/budget-items/exceptions'

/**
 * Validator for budget item creation business rules
 */
export class BudgetItemCreationValidator {
  /**
   * Validates if a budget item can be added to a service order
   * @param serviceOrderStatus - The current status of the service order
   * @returns True if budget items can be added, false otherwise
   */
  public static canAddBudgetItems(serviceOrderStatus: ServiceOrderStatus): boolean {
    return serviceOrderStatus === ServiceOrderStatus.IN_DIAGNOSIS
  }

  /**
   * Validates if a budget item can be added and throws an error if not
   * @param serviceOrderStatus - The current status of the service order
   * @param serviceOrderId - The ID of the service order for error message
   * @throws Error if budget items cannot be added
   */
  public static validateCanAddBudgetItems(
    serviceOrderStatus: ServiceOrderStatus,
    serviceOrderId: string,
  ): void {
    if (!this.canAddBudgetItems(serviceOrderStatus)) {
      throw new InvalidServiceOrderStatusForBudgetItemException(serviceOrderId, serviceOrderStatus)
    }
  }
}
