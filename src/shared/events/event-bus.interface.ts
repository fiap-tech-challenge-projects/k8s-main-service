import { DomainEvent } from './domain-event.interface'
import { EventHandler } from './event-handler.interface'

/**
 * Token for EventBus dependency injection
 */
export const EVENT_BUS = Symbol('EVENT_BUS')

/**
 * Interface for event bus
 * Defines the contract for publishing and subscribing to domain events
 */
export interface EventBus {
  /**
   * Publish a domain event
   * @param event - The domain event to publish
   * @returns Promise that resolves when the event is published
   */
  publish(event: DomainEvent): Promise<void>

  /**
   * Subscribe to events of a specific type
   * @param eventType - The type of events to subscribe to
   * @param handler - The event handler
   * @returns Promise that resolves when the subscription is registered
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): Promise<void>

  /**
   * Unsubscribe from events of a specific type
   * @param eventType - The type of events to unsubscribe from
   * @param handler - The event handler to unsubscribe
   * @returns Promise that resolves when the unsubscription is completed
   */
  unsubscribe(eventType: string, handler: EventHandler): Promise<void>
}
