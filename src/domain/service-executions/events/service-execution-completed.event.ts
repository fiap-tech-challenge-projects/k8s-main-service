import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a service execution is completed
 */
export class ServiceExecutionCompletedEvent extends BaseDomainEvent {
  /**
   * Creates a new ServiceExecutionCompletedEvent
   * @param serviceExecutionId - The ID of the service execution
   * @param data - Event data containing completion information
   * @param data.serviceOrderId - The ID of the service order
   * @param data.mechanicId - The ID of the mechanic
   * @param data.clientId - The ID of the client
   * @param data.completedAt - The timestamp when the service execution was completed
   * @param data.durationInMinutes - The duration of the service execution in minutes
   */
  constructor(
    serviceExecutionId: string,
    data: {
      serviceOrderId: string
      mechanicId?: string
      clientId: string
      completedAt: Date
      durationInMinutes?: number
    },
  ) {
    super(serviceExecutionId, 'ServiceExecutionCompleted', data)
  }
}
