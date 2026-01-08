import { DomainEvent } from './domain-event.interface'

/**
 * Interface for event handlers
 * Defines the contract for handling domain events
 */
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  /**
   * Handle a domain event
   * @param event - The domain event to handle
   * @returns Promise that resolves when the event is handled
   */
  handle(event: T): Promise<void>

  /**
   * Get the event type this handler can handle
   * @returns The event type string
   */
  getEventType(): string
}
