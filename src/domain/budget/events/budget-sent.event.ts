import { BaseDomainEvent } from '@shared/events'

/**
 * Event emitted when a budget is sent to a client for approval
 */
export class BudgetSentEvent extends BaseDomainEvent {
  /**
   * Creates a new BudgetSentEvent
   * @param budgetId - The ID of the budget that was sent
   * @param data - Event data containing client and budget information
   * @param data.clientId - The ID of the client
   * @param data.clientName - The name of the client
   * @param data.clientEmail - The email of the client
   * @param data.budgetTotal - The total amount of the budget
   * @param data.validityPeriod - The validity period of the budget in days
   */
  constructor(
    budgetId: string,
    data: {
      clientId: string
      clientName: string
      clientEmail: string
      budgetTotal: string
      validityPeriod: number
    },
  ) {
    super(budgetId, 'BudgetSent', data)
  }
}
