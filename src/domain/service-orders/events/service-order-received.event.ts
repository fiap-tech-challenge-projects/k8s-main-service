import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a service order is received (status changes to RECEIVED)
 */
export class ServiceOrderReceivedEvent extends BaseDomainEvent {
  /**
   * Creates a new ServiceOrderReceivedEvent
   * @param serviceOrderId - The ID of the service order
   * @param data - Event data containing service order information
   * @param data.clientId - The ID of the client
   * @param data.vehicleId - The ID of the vehicle
   * @param data.receivedAt - The timestamp when the service order was received
   */
  constructor(
    serviceOrderId: string,
    data: {
      clientId: string
      vehicleId: string
      receivedAt: Date
    },
  ) {
    super(serviceOrderId, 'ServiceOrderReceived', data)
  }
}
