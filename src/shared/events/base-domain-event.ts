import { v4 as uuidv4 } from 'uuid'

import { DomainEvent } from './domain-event.interface'

/**
 * Base class for all domain events
 * Provides common implementation for domain event properties
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string
  public readonly aggregateId: string
  public readonly eventType: string
  public readonly timestamp: Date
  public readonly version: number
  public readonly data: Record<string, unknown>

  /**
   * Creates a new domain event
   * @param aggregateId - Identifier of the aggregate that generated this event
   * @param eventType - Type of the event
   * @param data - Event-specific data
   * @param version - Version of the aggregate when this event was generated
   */
  constructor(
    aggregateId: string,
    eventType: string,
    data: Record<string, unknown>,
    version: number = 1,
  ) {
    this.eventId = uuidv4()
    this.aggregateId = aggregateId
    this.eventType = eventType
    this.timestamp = new Date()
    this.version = version
    this.data = data
  }
}
