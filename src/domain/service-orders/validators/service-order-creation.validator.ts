import { UserRole } from '@prisma/client'

import {
  ServiceOrderUnauthorizedOperationException,
  ServiceOrderVehicleOwnershipException,
} from '../exceptions'

/**
 * Validator for service order creation business rules
 */
export class ServiceOrderCreationValidator {
  /**
   * Validates if a client can create a service order for a specific vehicle
   * @param vehicleClientId - The client ID associated with the vehicle
   * @param requestingClientId - The client ID making the request
   * @param vehicleId - The vehicle ID for error message
   * @throws ServiceOrderVehicleOwnershipException if the client cannot create a service order for this vehicle
   */
  public static validateClientCanCreateForVehicle(
    vehicleClientId: string,
    requestingClientId: string,
    vehicleId: string,
  ): void {
    if (vehicleClientId !== requestingClientId) {
      throw new ServiceOrderVehicleOwnershipException(vehicleId, requestingClientId)
    }
  }

  /**
   * Validates if a user can create service orders
   * @param userRole - The role of the user attempting to create a service order
   * @returns True if the user can create service orders, false otherwise
   */
  public static canCreateServiceOrder(userRole: UserRole): boolean {
    return userRole === UserRole.EMPLOYEE || userRole === UserRole.CLIENT
  }

  /**
   * Validates if a user can create service orders and throws an error if not
   * @param userRole - The role of the user attempting to create a service order
   * @throws ServiceOrderUnauthorizedOperationException if the user cannot create service orders
   */
  public static validateCanCreateServiceOrder(userRole: UserRole): void {
    if (!this.canCreateServiceOrder(userRole)) {
      throw new ServiceOrderUnauthorizedOperationException(
        'create service orders',
        userRole,
        'Only EMPLOYEE and CLIENT users can create service orders.',
      )
    }
  }
}
