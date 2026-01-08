import { Logger } from '@nestjs/common'
import { BudgetItemType } from '@prisma/client'

import {
  GetBudgetByServiceOrderIdUseCase,
  GetBudgetItemsUseCase,
} from '@application/budget/use-cases'
import { GetEmployeeByIdUseCase } from '@application/employees/use-cases'
import { CreateServiceExecutionUseCase } from '@application/service-executions/use-cases'
import { DecreaseStockUseCase } from '@application/stock/use-cases'
import { ServiceOrderApprovedEvent } from '@domain/service-orders/events'
import { EventHandler } from '@shared/events'

/**
 * Event handler for ServiceOrderApprovedEvent
 * Auto-creates a service execution when a service order is approved
 */
export class ServiceOrderApprovedHandler implements EventHandler<ServiceOrderApprovedEvent> {
  /**
   * Logger instance for this handler
   */
  private readonly logger = new Logger(ServiceOrderApprovedHandler.name)

  /**
   * Creates a new ServiceOrderApprovedHandler
   * @param createServiceExecutionUseCase - Use case for creating service execution
   * @param getBudgetByServiceOrderIdUseCase - Use case for getting budget by service order ID
   * @param getBudgetItemsUseCase - Use case for getting budget items
   * @param decreaseStockUseCase - Use case for decreasing stock
   * @param getEmployeeByIdUseCase - Use case for getting employee by ID
   */
  constructor(
    private readonly createServiceExecutionUseCase: CreateServiceExecutionUseCase,
    private readonly getBudgetByServiceOrderIdUseCase: GetBudgetByServiceOrderIdUseCase,
    private readonly getBudgetItemsUseCase: GetBudgetItemsUseCase,
    private readonly decreaseStockUseCase: DecreaseStockUseCase,
    private readonly getEmployeeByIdUseCase: GetEmployeeByIdUseCase,
  ) {}

  /**
   * Handle ServiceOrderApprovedEvent
   * @param event - The service order approved event
   */
  async handle(event: ServiceOrderApprovedEvent): Promise<void> {
    const serviceOrderId = event.aggregateId
    const { approvedBy } = event.data as {
      clientId: string
      vehicleId: string
      approvedBy: string
      approvedAt: Date
    }

    try {
      // Check if the person who approved is an employee
      const isEmployee = await this.isEmployee(approvedBy)

      if (isEmployee) {
        // Only create service execution if approved by an employee
        const serviceExecutionResult = await this.createServiceExecutionUseCase.execute({
          serviceOrderId,
          mechanicId: approvedBy, // Assign to the employee who approved
          notes:
            'Service execution automatically created when service order was approved by employee',
        })

        if (serviceExecutionResult.isSuccess) {
          this.logger.log(
            `Service execution ${serviceExecutionResult.value.id} created for service order ${serviceOrderId} by employee ${approvedBy}`,
          )
        } else {
          this.logger.error(
            `Failed to create service execution for service order ${serviceOrderId}:`,
            serviceExecutionResult.error,
          )
        }
      } else {
        this.logger.log(
          `Service order ${serviceOrderId} approved by client ${approvedBy}. No service execution created automatically.`,
        )
      }

      // Always decrease stock items regardless of who approved
      await this.decreaseStockItems(serviceOrderId)
    } catch (error) {
      this.logger.error(
        `Failed to handle service order approval for service order ${serviceOrderId}:`,
        error as Error,
      )
      throw error
    }
  }

  /**
   * Decrease stock items for the approved budget
   * @param serviceOrderId - The service order ID
   */
  private async decreaseStockItems(serviceOrderId: string): Promise<void> {
    try {
      const budgetResult = await this.getBudgetByServiceOrderIdUseCase.execute(serviceOrderId)
      if (budgetResult.isFailure || !budgetResult.value) {
        this.logger.warn(`No budget found for service order ${serviceOrderId}`)
        return
      }

      const budget = budgetResult.value
      const budgetItemsResult = await this.getBudgetItemsUseCase.execute(budget.id)
      if (!budgetItemsResult.isSuccess) {
        this.logger.error(
          `Failed to get budget items for budget ${budget.id}:`,
          budgetItemsResult.error,
        )
        return
      }

      const budgetItems = budgetItemsResult.value
      const stockItems = budgetItems.filter((item) => item.type === BudgetItemType.STOCK_ITEM)

      for (const item of stockItems) {
        if (item.stockItemId) {
          await this.decreaseStockUseCase.execute(
            item.stockItemId,
            item.quantity,
            `Used for service order ${serviceOrderId}`,
          )
        }
      }

      this.logger.log(`Stock items decreased for service order ${serviceOrderId}`)
    } catch (error) {
      this.logger.error(
        `Failed to decrease stock items for service order ${serviceOrderId}:`,
        error as Error,
      )
      throw error
    }
  }

  /**
   * Check if a user ID belongs to an employee
   * @param userId - The user ID to check
   * @returns Promise resolving to true if user is an employee, false otherwise
   */
  private async isEmployee(userId: string): Promise<boolean> {
    try {
      const result = await this.getEmployeeByIdUseCase.execute(userId)
      return result.isSuccess
    } catch (error) {
      // If employee not found, it's not an employee
      this.logger.error(
        `User ${userId} is not an employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      return false
    }
  }

  /**
   * Get the event type this handler can handle
   * @returns The event type string
   */
  getEventType(): string {
    return 'ServiceOrderApproved'
  }
}
