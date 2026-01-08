/**
 * Base interface for all domain events
 * Provides common properties that all domain events should have
 */
export interface DomainEvent {
  /**
   * Unique identifier for the event
   */
  eventId: string

  /**
   * Identifier of the aggregate that generated this event
   */
  aggregateId: string

  /**
   * Type of the event (e.g., 'BudgetSent', 'BudgetApproved')
   */
  eventType: string

  /**
   * Timestamp when the event occurred
   */
  timestamp: Date

  /**
   * Version of the aggregate when this event was generated
   */
  version: number

  /**
   * Event-specific data
   */
  data: Record<string, unknown>
}
