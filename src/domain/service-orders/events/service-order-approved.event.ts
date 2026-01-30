import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a service order is approved
 */
export class ServiceOrderApprovedEvent extends BaseDomainEvent {
  /**
   * Creates a new ServiceOrderApprovedEvent
   * @param serviceOrderId - The ID of the service order
   * @param data - Event data containing approval information
   * @param data.clientId - The ID of the client
   * @param data.vehicleId - The ID of the vehicle
   * @param data.approvedBy - The ID of the user who approved the service order
   * @param data.approvedAt - The timestamp when the service order was approved
   */
  constructor(
    serviceOrderId: string,
    data: {
      clientId: string
      vehicleId: string
      approvedBy: string
      approvedAt: Date
    },
  ) {
    super(serviceOrderId, 'ServiceOrderApproved', data)
  }
}
