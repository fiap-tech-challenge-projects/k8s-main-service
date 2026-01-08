import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a budget is approved by the client
 */
export class BudgetApprovedEvent extends BaseDomainEvent {
  /**
   * Creates a new BudgetApprovedEvent
   * @param budgetId - The ID of the budget that was approved
   * @param data - Event data containing client and budget information
   * @param data.clientId - The ID of the client
   * @param data.clientName - The name of the client
   * @param data.clientEmail - The email of the client
   * @param data.budgetTotal - The total amount of the budget
   * @param data.approvedAt - The timestamp when the budget was approved
   */
  constructor(
    budgetId: string,
    data: {
      clientId: string
      clientName: string
      clientEmail: string
      budgetTotal: string
      approvedAt: Date
    },
  ) {
    super(budgetId, 'BudgetApproved', data)
  }
}
