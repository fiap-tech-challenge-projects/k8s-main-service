import { ServiceOrderStatus } from '@prisma/client'

import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a service order status changes
 */
export class ServiceOrderStatusChangedEvent extends BaseDomainEvent {
  /**
   * Creates a new ServiceOrderStatusChangedEvent
   * @param serviceOrderId - The ID of the service order
   * @param data - Event data containing status change information
   * @param data.previousStatus - The previous status of the service order
   * @param data.newStatus - The new status of the service order
   * @param data.clientId - The ID of the client
   * @param data.vehicleId - The ID of the vehicle
   * @param data.changedBy - The ID of the user who changed the status
   * @param data.changedAt - The timestamp when the status was changed
   */
  constructor(
    serviceOrderId: string,
    data: {
      previousStatus: ServiceOrderStatus
      newStatus: ServiceOrderStatus
      clientId: string
      vehicleId: string
      changedBy: string
      changedAt: Date
    },
  ) {
    super(serviceOrderId, 'ServiceOrderStatusChanged', data)
  }
}
