import { UserRole, ServiceOrderStatus } from '@prisma/client'

import { DomainException } from '@shared'

/**
 * Exception thrown when a user is not authorized to perform a service order operation
 */
export class ServiceOrderUnauthorizedOperationException extends DomainException {
  /**
   * Constructor for service order unauthorized operation exception
   * @param operation - The operation that was attempted
   * @param userRole - The role of the user attempting the operation
   * @param details - Additional details about why the operation is unauthorized
   */
  constructor(operation: string, userRole: UserRole, details?: string) {
    const message = details
      ? `User with role ${userRole} is not authorized to ${operation}. ${details}`
      : `User with role ${userRole} is not authorized to ${operation}`
    super(message, 'ServiceOrderUnauthorizedOperationException')
  }
}

/**
 * Exception thrown when a user is not authorized to change service order status
 */
export class ServiceOrderUnauthorizedStatusChangeException extends DomainException {
  /**
   * Constructor for service order unauthorized status change exception
   * @param serviceOrderId - The ID of the service order
   * @param currentStatus - The current status
   * @param newStatus - The attempted new status
   * @param userRole - The role of the user attempting the change
   */
  constructor(
    serviceOrderId: string,
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
    userRole: UserRole,
  ) {
    const message = `User with role ${userRole} cannot change service order ${serviceOrderId} status from ${currentStatus} to ${newStatus}`
    super(message, 'ServiceOrderUnauthorizedStatusChangeException')
  }
}

/**
 * Exception thrown when a client attempts to create a service order for a vehicle they don't own
 */
export class ServiceOrderVehicleOwnershipException extends DomainException {
  /**
   * Constructor for service order vehicle ownership exception
   * @param vehicleId - The ID of the vehicle
   * @param clientId - The ID of the client attempting the operation
   */
  constructor(vehicleId: string, clientId: string) {
    const message = `Vehicle ${vehicleId} does not belong to client ${clientId}`
    super(message, 'ServiceOrderVehicleOwnershipException')
  }
}
