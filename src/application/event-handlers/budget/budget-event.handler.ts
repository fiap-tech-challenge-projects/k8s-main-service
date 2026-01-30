import { Injectable, Logger } from '@nestjs/common'

import { GetBudgetByIdUseCase } from '@application/budget/use-cases'
import { GetClientByIdUseCase } from '@application/clients/use-cases'
import { UpdateServiceOrderStatusUseCase } from '@application/service-orders/use-cases'
import { BudgetSentEvent, BudgetApprovedEvent, BudgetRejectedEvent } from '@domain/budget/events'
import { ServiceOrderStatus } from '@domain/service-orders/value-objects'
import { EventHandler, DomainEvent } from '@shared/events'

import { BudgetEmailService } from './budget-email.service'

/**
 * Event handler for budget-related domain events
 */
@Injectable()
export class BudgetEventHandler implements EventHandler {
  /**
   * Logger instance for this handler
   */
  private readonly logger = new Logger(BudgetEventHandler.name)

  /**
   * Creates a new instance of BudgetEventHandler
   * @param budgetEmailService - Service for budget-specific email operations
   * @param getClientByIdUseCase - Use case for getting client by ID
   * @param updateServiceOrderStatusUseCase - Use case for updating service order status
   * @param getBudgetByIdUseCase - Use case for getting budget by ID
   */
  constructor(
    private readonly budgetEmailService: BudgetEmailService,
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
    private readonly updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase,
    private readonly getBudgetByIdUseCase: GetBudgetByIdUseCase,
  ) {}

  /**
   * Handle budget-related domain events
   * @param event - The domain event to handle
   * @returns Promise that resolves when the event is handled
   */
  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'BudgetSent':
        await this.handleBudgetSent(event as BudgetSentEvent)
        break
      case 'BudgetApproved':
        await this.handleBudgetApproved(event as BudgetApprovedEvent)
        break
      case 'BudgetRejected':
        await this.handleBudgetRejected(event as BudgetRejectedEvent)
        break
      default:
        this.logger.warn(`Unknown event type: ${event.eventType}`)
    }
  }

  /**
   * Get the event types this handler can handle
   * @returns Array of event type strings
   */
  getEventType(): string {
    return 'BudgetEvents'
  }

  /**
   * Handle BudgetSent event
   * @param event - The BudgetSent event
   */
  private async handleBudgetSent(event: BudgetSentEvent): Promise<void> {
    try {
      this.logger.log(`Handling BudgetSent event for budget ${event.aggregateId}`)

      const { clientId, budgetTotal, validityPeriod } = event.data as {
        clientId: string
        budgetTotal: string
        validityPeriod: number
      }

      // Get the budget to find the service order ID
      const budgetResult = await this.getBudgetByIdUseCase.execute(event.aggregateId)
      if (!budgetResult.isSuccess) {
        this.logger.warn(`Budget not found: ${event.aggregateId}`)
        return
      }

      const budget = budgetResult.value

      // Update service order status to AWAITING_APPROVAL
      await this.updateServiceOrderStatusUseCase.execute(
        budget.serviceOrderId,
        ServiceOrderStatus.AWAITING_APPROVAL,
        'system',
      )
      this.logger.log(`Service order ${budget.serviceOrderId} status updated to AWAITING_APPROVAL`)

      const clientResult = await this.getClientByIdUseCase.execute(clientId)
      if (!clientResult.isSuccess) {
        this.logger.warn(
          `Client not found for budget ${event.aggregateId}: ${clientResult.error.message}`,
        )
        return
      }

      await this.budgetEmailService.sendBudgetToClient(
        clientResult.value,
        event.aggregateId,
        budgetTotal,
        validityPeriod,
      )
      this.logger.log(`Budget sent email sent successfully for budget ${event.aggregateId}`)
    } catch (error) {
      this.logger.error(`Error handling BudgetSent event for budget ${event.aggregateId}:`, error)
    }
  }

  /**
   * Handle BudgetApproved event
   * @param event - The BudgetApproved event
   */
  private async handleBudgetApproved(event: BudgetApprovedEvent): Promise<void> {
    try {
      this.logger.log(`Handling BudgetApproved event for budget ${event.aggregateId}`)

      const { clientId, budgetTotal } = event.data as {
        clientId: string
        budgetTotal: string
      }

      // Get the budget to find the service order ID
      const budgetResult = await this.getBudgetByIdUseCase.execute(event.aggregateId)
      if (!budgetResult.isSuccess) {
        this.logger.warn(`Budget not found: ${event.aggregateId}`)
        return
      }

      const budget = budgetResult.value

      // Update service order status to APPROVED
      await this.updateServiceOrderStatusUseCase.execute(
        budget.serviceOrderId,
        ServiceOrderStatus.APPROVED,
        'system',
      )
      this.logger.log(`Service order ${budget.serviceOrderId} status updated to APPROVED`)

      const clientResult = await this.getClientByIdUseCase.execute(clientId)
      if (!clientResult.isSuccess) {
        this.logger.warn(
          `Client not found for budget ${event.aggregateId}: ${clientResult.error.message}`,
        )
        return
      }

      await this.budgetEmailService.sendBudgetApprovalNotification(
        clientResult.value,
        event.aggregateId,
        budgetTotal,
      )
      this.logger.log(`Budget approval email sent successfully for budget ${event.aggregateId}`)
    } catch (error) {
      this.logger.error(
        `Error handling BudgetApproved event for budget ${event.aggregateId}:`,
        error,
      )
    }
  }

  /**
   * Handle BudgetRejected event
   * @param event - The BudgetRejected event
   */
  private async handleBudgetRejected(event: BudgetRejectedEvent): Promise<void> {
    try {
      this.logger.log(`Handling BudgetRejected event for budget ${event.aggregateId}`)

      const { clientId, budgetTotal, reason } = event.data as {
        clientId: string
        budgetTotal: string
        reason?: string
      }

      // Get the budget to find the service order ID
      const budgetResult = await this.getBudgetByIdUseCase.execute(event.aggregateId)
      if (!budgetResult.isSuccess) {
        this.logger.warn(`Budget not found: ${event.aggregateId}`)
        return
      }

      const budget = budgetResult.value

      // Update service order status to REJECTED
      await this.updateServiceOrderStatusUseCase.execute(
        budget.serviceOrderId,
        ServiceOrderStatus.REJECTED,
        'system',
      )
      this.logger.log(`Service order ${budget.serviceOrderId} status updated to REJECTED`)

      const clientResult = await this.getClientByIdUseCase.execute(clientId)
      if (!clientResult.isSuccess) {
        this.logger.warn(
          `Client not found for budget ${event.aggregateId}: ${clientResult.error.message}`,
        )
        return
      }

      await this.budgetEmailService.sendBudgetRejectionNotification(
        clientResult.value,
        event.aggregateId,
        budgetTotal,
        reason,
      )
      this.logger.log(`Budget rejection email sent successfully for budget ${event.aggregateId}`)
    } catch (error) {
      this.logger.error(
        `Error handling BudgetRejected event for budget ${event.aggregateId}:`,
        error,
      )
    }
  }
}
