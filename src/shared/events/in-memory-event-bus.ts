import { Injectable, Logger } from '@nestjs/common'

import { DomainEvent } from './domain-event.interface'
import { EventBus } from './event-bus.interface'
import { EventHandler } from './event-handler.interface'

/**
 * In-memory implementation of the event bus
 * Handles event publishing and subscription management
 */
@Injectable()
export class InMemoryEventBus implements EventBus {
  private readonly logger = new Logger(InMemoryEventBus.name)
  private readonly handlers = new Map<string, EventHandler[]>()

  /**
   * Publish a domain event to all registered handlers
   * @param event - The domain event to publish
   * @returns Promise that resolves when the event is published
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? []

    if (handlers.length === 0) {
      this.logger.debug(`No handlers registered for event type: ${event.eventType}`)
      return
    }

    this.logger.debug(`Publishing event ${event.eventType} to ${handlers.length} handlers`)

    const promises = handlers.map(async (handler) => {
      try {
        await handler.handle(event)
        this.logger.debug(
          `Event ${event.eventType} handled successfully by ${handler.constructor.name}`,
        )
      } catch (error) {
        this.logger.error(
          `Error handling event ${event.eventType} by ${handler.constructor.name}:`,
          error,
        )
        // Don't throw to avoid breaking other handlers
      }
    })

    await Promise.all(promises)
  }

  /**
   * Subscribe to events of a specific type
   * @param eventType - The type of events to subscribe to
   * @param handler - The event handler
   * @returns Promise that resolves when the subscription is registered
   */
  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): Promise<void> {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }

    const handlers = this.handlers.get(eventType)!

    // Check if handler is already registered
    const existingHandler = handlers.find((h) => h === handler)
    if (existingHandler) {
      this.logger.warn(
        `Handler ${handler.constructor.name} is already registered for event type: ${eventType}`,
      )
      return
    }

    handlers.push(handler)
    this.logger.debug(`Handler ${handler.constructor.name} registered for event type: ${eventType}`)
  }

  /**
   * Unsubscribe from events of a specific type
   * @param eventType - The type of events to unsubscribe from
   * @param handler - The event handler to unsubscribe
   * @returns Promise that resolves when the unsubscription is completed
   */
  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType)
    if (!handlers) {
      this.logger.warn(`No handlers registered for event type: ${eventType}`)
      return
    }

    const index = handlers.indexOf(handler)
    if (index === -1) {
      this.logger.warn(`Handler ${handler.constructor.name} not found for event type: ${eventType}`)
      return
    }

    handlers.splice(index, 1)
    this.logger.debug(
      `Handler ${handler.constructor.name} unregistered from event type: ${eventType}`,
    )

    if (handlers.length === 0) {
      this.handlers.delete(eventType)
    }
  }
}
