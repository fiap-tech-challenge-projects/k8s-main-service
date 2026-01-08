import { ServiceOrderStatus } from '@prisma/client'

import { ServiceOrder } from '@domain/service-orders/entities'

/**
 * Factory for creating ServiceOrder entities for testing purposes.
 */
export class ServiceOrderFactory {
  /**
   * Creates a service order with default values.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance
   */
  static create(
    overrides: Partial<{
      id: string
      status: ServiceOrderStatus
      requestDate: Date
      deliveryDate: Date | undefined
      cancellationReason: string | undefined
      notes: string | undefined
      clientId: string
      vehicleId: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): ServiceOrder {
    const now = new Date()
    const defaults = {
      id: 'so-123',
      status: ServiceOrderStatus.REQUESTED,
      requestDate: now,
      deliveryDate: undefined as Date | undefined,
      cancellationReason: undefined as string | undefined,
      notes: undefined as string | undefined,
      clientId: 'client-123',
      vehicleId: 'vehicle-456',
      createdAt: now,
      updatedAt: now,
    }

    const data = { ...defaults, ...overrides }

    return new ServiceOrder(
      data.id,
      data.status,
      data.requestDate,
      data.deliveryDate,
      data.cancellationReason,
      data.notes,
      data.clientId,
      data.vehicleId,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Creates a service order with REQUESTED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with REQUESTED status
   */
  static createRequested(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.REQUESTED,
      ...overrides,
    })
  }

  /**
   * Creates a service order with RECEIVED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with RECEIVED status
   */
  static createReceived(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.RECEIVED,
      ...overrides,
    })
  }

  /**
   * Creates a service order with IN_DIAGNOSIS status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with IN_DIAGNOSIS status
   */
  static createInDiagnosis(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      ...overrides,
    })
  }

  /**
   * Creates a service order with AWAITING_APPROVAL status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with AWAITING_APPROVAL status
   */
  static createAwaitingApproval(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      ...overrides,
    })
  }

  /**
   * Creates a service order with APPROVED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with APPROVED status
   */
  static createApproved(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.APPROVED,
      ...overrides,
    })
  }

  /**
   * Creates a service order with REJECTED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with REJECTED status
   */
  static createRejected(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.REJECTED,
      ...overrides,
    })
  }

  /**
   * Creates a service order with SCHEDULED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with SCHEDULED status
   */
  static createScheduled(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.SCHEDULED,
      ...overrides,
    })
  }

  /**
   * Creates a service order with IN_EXECUTION status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with IN_EXECUTION status
   */
  static createInExecution(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.IN_EXECUTION,
      ...overrides,
    })
  }

  /**
   * Creates a service order with FINISHED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with FINISHED status
   */
  static createFinished(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.FINISHED,
      ...overrides,
    })
  }

  /**
   * Creates a service order with DELIVERED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with DELIVERED status
   */
  static createDelivered(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.DELIVERED,
      deliveryDate: new Date(),
      ...overrides,
    })
  }

  /**
   * Creates a service order with CANCELLED status.
   * @param overrides - Optional overrides for the service order properties
   * @returns A new ServiceOrder instance with CANCELLED status
   */
  static createCancelled(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
    return this.create({
      status: ServiceOrderStatus.CANCELLED,
      cancellationReason: 'Customer requested cancellation',
      ...overrides,
    })
  }
}

/**
 * Convenience function to create a service order with default values.
 * @param overrides - Optional overrides for the service order properties
 * @returns A new ServiceOrder instance
 */
export const createServiceOrderFactory = (overrides: Partial<ServiceOrder> = {}): ServiceOrder => {
  return ServiceOrderFactory.create(overrides)
}
