import { Logger } from '@nestjs/common'
import { ServiceOrderStatus } from '@prisma/client'

import {
  GetServiceOrderByIdUseCase,
  UpdateServiceOrderStatusUseCase,
} from '@application/service-orders/use-cases'
import { ServiceExecutionStatusChangedEvent } from '@domain/service-executions/events'
import { ServiceOrderStatus as DomainServiceOrderStatus } from '@domain/service-orders/value-objects'
import { EventHandler } from '@shared/events'

/**
 * Event handler for ServiceExecutionStatusChangedEvent
 * Updates service order status based on service execution status changes
 */
export class ServiceExecutionStatusChangedHandler implements EventHandler<ServiceExecutionStatusChangedEvent> {
  /**
   * Logger instance for this handler
   */
  private readonly logger = new Logger(ServiceExecutionStatusChangedHandler.name)

  /**
   * Creates a new ServiceExecutionStatusChangedHandler
   * @param getServiceOrderByIdUseCase - Use case for getting service order
   * @param updateServiceOrderStatusUseCase - Use case for updating service order status
   */
  constructor(
    private readonly getServiceOrderByIdUseCase: GetServiceOrderByIdUseCase,
    private readonly updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase,
  ) {}

  /**
   * Handle ServiceExecutionStatusChangedEvent
   * @param event - The service execution status changed event
   */
  async handle(event: ServiceExecutionStatusChangedEvent): Promise<void> {
    const { data } = event
    const { previousStatus, newStatus, serviceOrderId, changedBy } = data as {
      previousStatus: string
      newStatus: string
      serviceOrderId: string
      mechanicId?: string
      changedBy: string
      changedAt: Date
    }

    this.logger.log(
      `Handling ServiceExecutionStatusChanged event: serviceOrderId=${serviceOrderId}, previousStatus=${previousStatus}, newStatus=${newStatus}, changedBy=${changedBy}`,
    )

    try {
      let newServiceOrderStatus: ServiceOrderStatus | null = null

      if (newStatus === 'IN_PROGRESS' && previousStatus === 'ASSIGNED') {
        newServiceOrderStatus = ServiceOrderStatus.IN_EXECUTION
        this.logger.log(
          `Service execution changed from ASSIGNED to IN_PROGRESS. Will update service order ${serviceOrderId} to IN_EXECUTION`,
        )
      } else if (newStatus === 'COMPLETED' && previousStatus === 'IN_PROGRESS') {
        newServiceOrderStatus = ServiceOrderStatus.FINISHED
        this.logger.log(
          `Service execution changed from IN_PROGRESS to COMPLETED. Will update service order ${serviceOrderId} to FINISHED`,
        )
      } else {
        this.logger.log(
          `Service execution status change from ${previousStatus} to ${newStatus} does not require service order status update`,
        )
      }

      if (newServiceOrderStatus) {
        // First, let's check the current service order status
        try {
          const currentServiceOrderResult =
            await this.getServiceOrderByIdUseCase.execute(serviceOrderId)
          if (currentServiceOrderResult.isSuccess) {
            this.logger.log(
              `Current service order ${serviceOrderId} status: ${currentServiceOrderResult.value.status}`,
            )
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          this.logger.error(
            `Failed to get current service order ${serviceOrderId} status: ${errorMessage}`,
          )
        }

        this.logger.log(
          `Updating service order ${serviceOrderId} status to ${newServiceOrderStatus}`,
        )

        await this.updateServiceOrderStatusUseCase.execute(
          serviceOrderId,
          newServiceOrderStatus as DomainServiceOrderStatus,
          changedBy,
        )

        this.logger.log(
          `Service order ${serviceOrderId} status successfully updated to ${newServiceOrderStatus} due to service execution status change from ${previousStatus} to ${newStatus}`,
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Failed to update service order ${serviceOrderId} status due to service execution status change from ${previousStatus} to ${newStatus}: ${errorMessage}`,
      )
      throw error
    }
  }

  /**
   * Get the event type this handler can handle
   * @returns The event type string
   */
  getEventType(): string {
    return 'ServiceExecutionStatusChanged'
  }
}
