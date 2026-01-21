import { ServiceOrderStatus, UserRole } from '@prisma/client'

import { ServiceOrderUnauthorizedStatusChangeException } from '../exceptions'

/**
 * Validator for service order status change permissions
 */
export class ServiceOrderStatusChangeValidator {
  /**
   * Validates if a user can change service order status
   * @param currentStatus - The current status of the service order
   * @param newStatus - The new status to transition to
   * @param userRole - The role of the user making the change
   * @returns True if the user can make the status change, false otherwise
   */
  public static canChangeStatus(
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
    userRole: UserRole,
  ): boolean {
    if (newStatus === ServiceOrderStatus.CANCELLED) {
      return userRole === UserRole.ADMIN
    }

    if (newStatus === ServiceOrderStatus.APPROVED || newStatus === ServiceOrderStatus.REJECTED) {
      return userRole === UserRole.CLIENT || userRole === UserRole.EMPLOYEE
    }

    if (newStatus === ServiceOrderStatus.IN_DIAGNOSIS) {
      return userRole === UserRole.EMPLOYEE
    }

    if (
      newStatus === ServiceOrderStatus.IN_EXECUTION ||
      newStatus === ServiceOrderStatus.FINISHED
    ) {
      return userRole === UserRole.EMPLOYEE
    }

    if (newStatus === ServiceOrderStatus.DELIVERED) {
      return userRole === UserRole.EMPLOYEE
    }

    return true
  }

  /**
   * Validates if a user can change service order status and throws an error if not
   * @param currentStatus - The current status of the service order
   * @param newStatus - The new status to transition to
   * @param userRole - The role of the user making the change
   * @param serviceOrderId - The ID of the service order for error message
   * @throws ServiceOrderUnauthorizedStatusChangeException if the user cannot make the status change
   */
  public static validateCanChangeStatus(
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
    userRole: UserRole,
    serviceOrderId: string,
  ): void {
    if (!this.canChangeStatus(currentStatus, newStatus, userRole)) {
      throw new ServiceOrderUnauthorizedStatusChangeException(
        serviceOrderId,
        currentStatus,
        newStatus,
        userRole,
      )
    }
  }

  /**
   * Validates role-specific status change permissions with detailed error messages
   * @param currentStatus - The current status of the service order
   * @param newStatus - The new status to transition to
   * @param userRole - The role of the user making the change
   * @param serviceOrderId - The ID of the service order for error message
   * @throws ServiceOrderUnauthorizedStatusChangeException if the user cannot make the status change
   */
  public static validateRoleCanChangeStatus(
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
    userRole: UserRole,
    serviceOrderId: string,
  ): void {
    if (newStatus === ServiceOrderStatus.CANCELLED && userRole !== UserRole.ADMIN) {
      throw new ServiceOrderUnauthorizedStatusChangeException(
        serviceOrderId,
        currentStatus,
        newStatus,
        userRole,
      )
    }

    if (newStatus === ServiceOrderStatus.IN_DIAGNOSIS && userRole !== UserRole.EMPLOYEE) {
      throw new ServiceOrderUnauthorizedStatusChangeException(
        serviceOrderId,
        currentStatus,
        newStatus,
        userRole,
      )
    }

    if (
      (newStatus === ServiceOrderStatus.IN_EXECUTION ||
        newStatus === ServiceOrderStatus.FINISHED) &&
      userRole !== UserRole.EMPLOYEE
    ) {
      throw new ServiceOrderUnauthorizedStatusChangeException(
        serviceOrderId,
        currentStatus,
        newStatus,
        userRole,
      )
    }

    if (newStatus === ServiceOrderStatus.DELIVERED && userRole !== UserRole.EMPLOYEE) {
      throw new ServiceOrderUnauthorizedStatusChangeException(
        serviceOrderId,
        currentStatus,
        newStatus,
        userRole,
      )
    }
  }
}
