import { ServiceOrderStatus } from '@prisma/client'

import { BaseEntity } from '@shared'

import { InvalidServiceOrderStatusTransitionException } from '../exceptions'

/**
 * ServiceOrder aggregate root
 * Represents a service order in the mechanical workshop system
 */
export class ServiceOrder extends BaseEntity {
  public readonly status: ServiceOrderStatus
  public readonly requestDate: Date
  public readonly deliveryDate?: Date
  public readonly cancellationReason?: string
  public readonly notes?: string
  public readonly clientId: string
  public readonly vehicleId: string

  /**
   * Construct a service order
   * @param id - Unique identifier
   * @param status - Current status
   * @param requestDate - Date when requested
   * @param deliveryDate - Date when delivered
   * @param cancellationReason - Reason for cancellation
   * @param notes - Additional notes
   * @param clientId - Client identifier
   * @param vehicleId - Vehicle identifier
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  constructor(
    id: string,
    status: ServiceOrderStatus,
    requestDate: Date,
    deliveryDate: Date | undefined,
    cancellationReason: string | undefined,
    notes: string | undefined,
    clientId: string,
    vehicleId: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(id, createdAt, updatedAt)
    this.status = status
    this.requestDate = requestDate
    this.deliveryDate = deliveryDate
    this.cancellationReason = cancellationReason
    this.notes = notes
    this.clientId = clientId
    this.vehicleId = vehicleId
  }

  /**
   * Factory method to create a new service order with REQUESTED status
   * @param clientId - Client ID
   * @param vehicleId - Vehicle ID
   * @param notes - Optional notes
   * @returns New service order instance
   */
  public static create(clientId: string, vehicleId: string, notes?: string): ServiceOrder {
    const now = new Date()
    return new ServiceOrder(
      '',
      ServiceOrderStatus.REQUESTED,
      now,
      undefined,
      undefined,
      notes,
      clientId,
      vehicleId,
      now,
      now,
    )
  }

  /**
   * Factory to create a service order with RECEIVED status (for employee creation)
   * @param clientId - Client identifier
   * @param vehicleId - Vehicle identifier
   * @param notes - Optional notes
   * @returns New service order instance with RECEIVED status
   */
  public static createReceived(clientId: string, vehicleId: string, notes?: string): ServiceOrder {
    const now = new Date()
    return new ServiceOrder(
      '',
      ServiceOrderStatus.RECEIVED,
      now,
      undefined,
      undefined,
      notes,
      clientId,
      vehicleId,
      now,
      now,
    )
  }

  /**
   * Validates if a status transition is allowed
   * @param newStatus - The new status to transition to
   * @throws InvalidServiceOrderStatusTransitionException if the transition is not allowed
   */
  private validateStatusTransition(newStatus: ServiceOrderStatus): void {
    const allowedTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      [ServiceOrderStatus.REQUESTED]: [
        ServiceOrderStatus.RECEIVED,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.RECEIVED]: [
        ServiceOrderStatus.IN_DIAGNOSIS,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.IN_DIAGNOSIS]: [
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.AWAITING_APPROVAL]: [
        ServiceOrderStatus.APPROVED,
        ServiceOrderStatus.REJECTED,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.APPROVED]: [
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.REJECTED]: [ServiceOrderStatus.CANCELLED],
      [ServiceOrderStatus.SCHEDULED]: [
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.IN_EXECUTION]: [
        ServiceOrderStatus.FINISHED,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.FINISHED]: [
        ServiceOrderStatus.DELIVERED,
        ServiceOrderStatus.CANCELLED,
        ServiceOrderStatus.REJECTED,
      ],
      [ServiceOrderStatus.DELIVERED]: [ServiceOrderStatus.CANCELLED, ServiceOrderStatus.REJECTED],
      [ServiceOrderStatus.CANCELLED]: [],
    }

    const allowedStatuses = allowedTransitions[this.status]
    if (!allowedStatuses.includes(newStatus)) {
      throw new InvalidServiceOrderStatusTransitionException(
        this.status,
        newStatus,
        allowedStatuses,
      )
    }
  }

  /**
   * Mark order as received
   */
  public markReceived(): void {
    this.validateStatusTransition(ServiceOrderStatus.RECEIVED)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.RECEIVED
    this.updatedAt = new Date()
  }

  /**
   * Mark order as in diagnosis
   */
  public markInDiagnosis(): void {
    this.validateStatusTransition(ServiceOrderStatus.IN_DIAGNOSIS)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.IN_DIAGNOSIS
    this.updatedAt = new Date()
  }

  /**
   * Mark order as awaiting approval
   */
  public markAwaitingApproval(): void {
    this.validateStatusTransition(ServiceOrderStatus.AWAITING_APPROVAL)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.AWAITING_APPROVAL
    this.updatedAt = new Date()
  }

  /**
   * Mark order as approved
   */
  public markApproved(): void {
    this.validateStatusTransition(ServiceOrderStatus.APPROVED)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.APPROVED
    this.updatedAt = new Date()
  }

  /**
   * Mark order as rejected
   */
  public markRejected(): void {
    this.validateStatusTransition(ServiceOrderStatus.REJECTED)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.REJECTED
    this.updatedAt = new Date()
  }

  /**
   * Mark order as in execution
   */
  public markInExecution(): void {
    this.validateStatusTransition(ServiceOrderStatus.IN_EXECUTION)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.IN_EXECUTION
    this.updatedAt = new Date()
  }

  /**
   * Mark order as finished
   */
  public markFinished(): void {
    this.validateStatusTransition(ServiceOrderStatus.FINISHED)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.FINISHED
    this.updatedAt = new Date()
  }

  /**
   * Mark order as delivered
   */
  public markDelivered(): void {
    this.validateStatusTransition(ServiceOrderStatus.DELIVERED)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.DELIVERED
    this.updatedAt = new Date()
  }

  /**
   * Cancel order with reason
   * @param reason - Cancellation reason
   */
  public cancel(reason: string): void {
    this.validateStatusTransition(ServiceOrderStatus.CANCELLED)
    ;(this as { status: ServiceOrderStatus }).status = ServiceOrderStatus.CANCELLED
    ;(this as { cancellationReason: string }).cancellationReason = reason
    this.updatedAt = new Date()
  }

  /**
   * Update service order with new status
   * @param status - New status
   */
  public updateStatus(status: ServiceOrderStatus): void {
    this.validateStatusTransition(status)
    ;(this as { status: ServiceOrderStatus }).status = status
    this.updatedAt = new Date()
  }

  /**
   * Update delivery date
   * @param deliveryDate - New delivery date
   */
  public updateDeliveryDate(deliveryDate: Date): void {
    ;(this as { deliveryDate: Date }).deliveryDate = deliveryDate
    this.updatedAt = new Date()
  }

  /**
   * Update notes
   * @param notes - New notes
   */
  public updateNotes(notes: string): void {
    ;(this as { notes: string }).notes = notes
    this.updatedAt = new Date()
  }

  /**
   * Update cancellation reason
   * @param cancellationReason - New cancellation reason
   */
  public updateCancellationReason(cancellationReason: string): void {
    ;(this as { cancellationReason: string }).cancellationReason = cancellationReason
    this.updatedAt = new Date()
  }

  /**
   * Check if the service order is in a state where budget items can be added
   * @returns True if budget items can be added, false otherwise
   */
  public canAddBudgetItems(): boolean {
    return this.status === ServiceOrderStatus.IN_DIAGNOSIS
  }

  /**
   * Check if the service order can be approved or rejected
   * @returns True if the service order can be approved/rejected, false otherwise
   */
  public canBeApprovedOrRejected(): boolean {
    return this.status === ServiceOrderStatus.AWAITING_APPROVAL
  }

  /**
   * Check if the service order is in a final state
   * @returns True if the service order is in a final state, false otherwise
   */
  public isInFinalState(): boolean {
    const finalStates = [
      ServiceOrderStatus.DELIVERED,
      ServiceOrderStatus.CANCELLED,
      ServiceOrderStatus.REJECTED,
    ] as ServiceOrderStatus[]
    return finalStates.includes(this.status)
  }
}
