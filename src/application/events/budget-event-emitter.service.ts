import { Injectable, Inject, Logger } from '@nestjs/common'

import { GetClientByIdUseCase } from '@application/clients/use-cases'
import { Budget } from '@domain/budget/entities'
import { BudgetSentEvent, BudgetApprovedEvent, BudgetRejectedEvent } from '@domain/budget/events'
import { EventBus, EVENT_BUS } from '@shared/events'

/**
 * Service responsible for emitting budget-related domain events
 */
@Injectable()
export class BudgetEventEmitterService {
  /**
   * Logger instance for this service
   */
  private readonly logger = new Logger(BudgetEventEmitterService.name)

  /**
   * Creates a new instance of BudgetEventEmitterService
   * @param getClientByIdUseCase Use case for getting client by ID
   * @param eventBus Event bus for publishing domain events
   */
  constructor(
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Emit BudgetSent event
   * @param budget - The budget that was sent
   */
  async emitBudgetSentEvent(budget: Budget): Promise<void> {
    try {
      this.logger.log(
        `Attempting to emit BudgetSent event for budget ${budget.id} with clientId ${budget.clientId}`,
      )

      const clientResult = await this.getClientByIdUseCase.execute(budget.clientId)
      if (!clientResult.isSuccess) {
        this.logger.error(
          `Client not found for budget ${budget.id} with clientId ${budget.clientId}`,
        )
        this.logger.log(
          `Proceeding with event publication without client data for budget ${budget.id}`,
        )

        // Still publish the event for service order status update, even without client data
        const event = new BudgetSentEvent(budget.id, {
          clientId: budget.clientId,
          clientName: 'Unknown',
          clientEmail: 'unknown@example.com',
          budgetTotal: budget.totalAmount.toString(),
          validityPeriod: budget.validityPeriod,
        })

        await this.eventBus.publish(event)
        this.logger.log(`BudgetSent event published for budget ${budget.id} without client data`)
        return
      }

      const client = clientResult.value

      this.logger.log(`Found client ${client.id} for budget ${budget.id}`)

      const event = new BudgetSentEvent(budget.id, {
        clientId: budget.clientId,
        clientName: client.name,
        clientEmail: client.email,
        budgetTotal: budget.getFormattedTotalAmount(),
        validityPeriod: budget.validityPeriod,
      })

      this.logger.log(`Publishing BudgetSent event for budget ${budget.id}`)
      await this.eventBus.publish(event)
      this.logger.log(`BudgetSent event published successfully for budget ${budget.id}`)
    } catch (error) {
      this.logger.error(`Error publishing BudgetSent event for budget ${budget.id}:`, error)
      if (error instanceof Error) {
        this.logger.error(`Error details: ${error.message}`)
        this.logger.error(`Error stack: ${error.stack}`)
      }
    }
  }

  /**
   * Emit BudgetApproved event
   * @param budget - The budget that was approved
   */
  async emitBudgetApprovedEvent(budget: Budget): Promise<void> {
    try {
      const clientResult = await this.getClientByIdUseCase.execute(budget.clientId)
      if (!clientResult.isSuccess) {
        this.logger.warn(`Client not found for budget ${budget.id}`)
        return
      }

      const client = clientResult.value

      const event = new BudgetApprovedEvent(budget.id, {
        clientId: budget.clientId,
        clientName: client.name,
        clientEmail: client.email,
        budgetTotal: budget.getFormattedTotalAmount(),
        approvedAt: new Date(),
      })

      await this.eventBus.publish(event)
      this.logger.log(`BudgetApproved event published for budget ${budget.id}`)
    } catch (error) {
      this.logger.error(`Error publishing BudgetApproved event for budget ${budget.id}:`, error)
    }
  }

  /**
   * Emit BudgetRejected event
   * @param budget - The budget that was rejected
   * @param reason - Optional rejection reason
   */
  async emitBudgetRejectedEvent(budget: Budget, reason?: string): Promise<void> {
    try {
      const clientResult = await this.getClientByIdUseCase.execute(budget.clientId)
      if (!clientResult.isSuccess) {
        this.logger.warn(`Client not found for budget ${budget.id}`)
        return
      }

      const client = clientResult.value

      const event = new BudgetRejectedEvent(budget.id, {
        clientId: budget.clientId,
        clientName: client.name,
        clientEmail: client.email,
        budgetTotal: budget.getFormattedTotalAmount(),
        reason,
        rejectedAt: new Date(),
      })

      await this.eventBus.publish(event)
      this.logger.log(`BudgetRejected event published for budget ${budget.id}`)
    } catch (error) {
      this.logger.error(`Error publishing BudgetRejected event for budget ${budget.id}:`, error)
    }
  }
}
