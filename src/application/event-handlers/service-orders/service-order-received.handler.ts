import { Logger } from '@nestjs/common'
import { DeliveryMethod } from '@prisma/client'

import { CreateBudgetUseCase } from '@application/budget/use-cases'
import { ServiceOrderReceivedEvent } from '@domain/service-orders/events'
import { EventHandler } from '@shared/events'

/**
 * Event handler for ServiceOrderReceivedEvent
 * Auto-creates a budget when a service order is received
 */
export class ServiceOrderReceivedHandler implements EventHandler<ServiceOrderReceivedEvent> {
  private readonly logger = new Logger(ServiceOrderReceivedHandler.name)

  /**
   * Creates a new ServiceOrderReceivedHandler
   * @param createBudgetUseCase - Use case for budget creation
   */
  constructor(private readonly createBudgetUseCase: CreateBudgetUseCase) {}

  /**
   * Handle ServiceOrderReceivedEvent
   * @param event - The service order received event
   */
  async handle(event: ServiceOrderReceivedEvent): Promise<void> {
    const serviceOrderId = event.aggregateId
    const { clientId } = event.data as { clientId: string; vehicleId: string; receivedAt: Date }

    this.logger.log(`Handling ServiceOrderReceived event for service order ${serviceOrderId}`)

    try {
      const budgetResult = await this.createBudgetUseCase.execute({
        serviceOrderId,
        clientId,
        validityPeriod: 7, // 7 days default validity
        deliveryMethod: DeliveryMethod.EMAIL,
        notes: 'Budget automatically generated when service order was received',
      })

      if (budgetResult.isSuccess) {
        const budget = budgetResult.value
        this.logger.log(`Budget ${budget.id} created for service order ${serviceOrderId}`)
      } else {
        this.logger.error(
          `Failed to create budget for service order ${serviceOrderId}:`,
          budgetResult.error,
        )
      }
    } catch (error) {
      this.logger.error(`Failed to create budget for service order ${serviceOrderId}:`, error)
      if (error instanceof Error) {
        this.logger.error(`Error details: ${error.message}`)
        this.logger.error(`Error stack: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Get the event type this handler can handle
   * @returns The event type string
   */
  getEventType(): string {
    return 'ServiceOrderReceived'
  }
}
