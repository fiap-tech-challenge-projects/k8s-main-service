import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a budget is rejected by a client
 */
export class BudgetRejectedEvent extends BaseDomainEvent {
  /**
   * Creates a new BudgetRejectedEvent
   * @param budgetId - The ID of the budget that was rejected
   * @param data - Event data containing client and budget information
   * @param data.clientId - The ID of the client
   * @param data.clientName - The name of the client
   * @param data.clientEmail - The email of the client
   * @param data.budgetTotal - The total amount of the budget
   * @param data.reason - Optional reason for rejection
   * @param data.rejectedAt - The timestamp when the budget was rejected
   */
  constructor(
    budgetId: string,
    data: {
      clientId: string
      clientName: string
      clientEmail: string
      budgetTotal: string
      reason?: string
      rejectedAt: Date
    },
  ) {
    super(budgetId, 'BudgetRejected', data)
  }
}
