import { ServiceExecutionStatus } from '@domain/service-executions/entities'
import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a service execution status changes
 */
export class ServiceExecutionStatusChangedEvent extends BaseDomainEvent {
  /**
   * Creates a new ServiceExecutionStatusChangedEvent
   * @param serviceExecutionId - The ID of the service execution
   * @param data - Event data containing status change information
   * @param data.previousStatus - The previous status of the service execution
   * @param data.newStatus - The new status of the service execution
   * @param data.serviceOrderId - The ID of the service order
   * @param data.mechanicId - The ID of the mechanic
   * @param data.changedBy - The ID of the user who changed the status
   * @param data.changedAt - The timestamp when the status was changed
   */
  constructor(
    serviceExecutionId: string,
    data: {
      previousStatus: ServiceExecutionStatus
      newStatus: ServiceExecutionStatus
      serviceOrderId: string
      mechanicId?: string
      changedBy: string
      changedAt: Date
    },
  ) {
    super(serviceExecutionId, 'ServiceExecutionStatusChanged', data)
  }
}
