import { BaseEntity } from '@shared/bases'

import { ServiceExecutionStatus } from '../enums'
import { MechanicNotAssignedException } from '../exceptions'
import { ServiceExecutionStatusValidator } from '../validators'

/**
 * ServiceExecution entity represents the actual execution of a service
 * by a mechanic, including time tracking and status management.
 */
export class ServiceExecution extends BaseEntity {
  private _status: ServiceExecutionStatus
  private _startTime?: Date
  private _endTime?: Date
  private _notes?: string
  private readonly _serviceOrderId: string
  private _mechanicId?: string

  /**
   * Gets the execution status
   * @returns The current execution status
   */
  public get status(): ServiceExecutionStatus {
    return this._status
  }
  /**
   * Gets the execution start time
   * @returns The start time or undefined if not started
   */
  public get startTime(): Date | undefined {
    return this._startTime
  }
  /**
   * Gets the execution end time
   * @returns The end time or undefined if not completed
   */
  public get endTime(): Date | undefined {
    return this._endTime
  }
  /**
   * Gets the execution notes
   * @returns The notes or undefined if none
   */
  public get notes(): string | undefined {
    return this._notes
  }
  /**
   * Gets the service order ID
   * @returns The service order ID
   */
  public get serviceOrderId(): string {
    return this._serviceOrderId
  }
  /**
   * Gets the assigned mechanic ID
   * @returns The mechanic ID or undefined if not assigned
   */
  public get mechanicId(): string | undefined {
    return this._mechanicId
  }

  /**
   * Creates a new ServiceExecution instance
   * @param id - The unique identifier
   * @param serviceOrderId - The service order ID
   * @param status - The execution status
   * @param startTime - The start time
   * @param endTime - The end time
   * @param notes - The execution notes
   * @param mechanicId - The mechanic ID
   * @param createdAt - The creation date
   * @param updatedAt - The last update date
   */
  constructor(
    id: string,
    serviceOrderId: string,
    status: ServiceExecutionStatus,
    startTime: Date | undefined,
    endTime: Date | undefined,
    notes: string | undefined,
    mechanicId: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt)
    this._status = status
    this._startTime = startTime
    this._endTime = endTime
    this._notes = notes
    this._serviceOrderId = serviceOrderId
    this._mechanicId = mechanicId
  }

  /**
   * Factory method to create a new ServiceExecution
   * @param serviceOrderId - The service order ID
   * @param mechanicId - The mechanic ID (optional)
   * @param notes - The execution notes (optional)
   * @returns A new ServiceExecution instance
   */
  public static create(
    serviceOrderId: string,
    mechanicId: string | undefined,
    notes: string | undefined,
  ): ServiceExecution {
    const now = new Date()
    return new ServiceExecution(
      '',
      serviceOrderId,
      ServiceExecutionStatus.ASSIGNED,
      undefined,
      undefined,
      notes,
      mechanicId,
      now,
      now,
    )
  }

  /**
   * Updates the current ServiceExecution with assigned mechanic
   * @param mechanicId - The mechanic ID to assign
   * @returns The current ServiceExecution instance with assigned mechanic
   */
  public updateAssignedMechanic(mechanicId: string): this {
    this._mechanicId = mechanicId
    this.updatedAt = new Date()
    return this
  }

  /**
   * Updates the current ServiceExecution with started execution
   * @returns The current ServiceExecution instance with started execution
   */
  public updateStartedExecution(): this {
    ServiceExecutionStatusValidator.validateTransition(
      this._status,
      ServiceExecutionStatus.IN_PROGRESS,
    )

    if (!this._mechanicId) {
      throw new MechanicNotAssignedException('Cannot start execution without assigned mechanic')
    }

    this._status = ServiceExecutionStatus.IN_PROGRESS
    this._startTime = new Date()
    this.updatedAt = new Date()
    return this
  }

  /**
   * Updates the current ServiceExecution with completed execution
   * @param notes - Optional completion notes
   * @returns The current ServiceExecution instance with completed execution
   */
  public updateCompletedExecution(notes?: string): this {
    ServiceExecutionStatusValidator.validateTransition(
      this._status,
      ServiceExecutionStatus.COMPLETED,
    )

    this._status = ServiceExecutionStatus.COMPLETED
    this._endTime = new Date()
    this._notes = notes ?? this._notes
    this.updatedAt = new Date()
    return this
  }

  /**
   * Updates the current ServiceExecution with updated notes
   * @param notes - The new notes
   * @returns The current ServiceExecution instance with updated notes
   */
  public updateNotes(notes: string): this {
    this._notes = notes
    this.updatedAt = new Date()
    return this
  }

  /**
   * Updates the current ServiceExecution with updated status
   * @param status - The new status
   * @returns The current ServiceExecution instance with updated status
   */
  public updateStatus(status: ServiceExecutionStatus): this {
    ServiceExecutionStatusValidator.validateTransition(this._status, status)

    // Set appropriate timestamps based on status
    if (status === ServiceExecutionStatus.IN_PROGRESS && !this._startTime) {
      this._startTime = new Date()
    } else if (status === ServiceExecutionStatus.COMPLETED && !this._endTime) {
      this._endTime = new Date()
    }

    this._status = status
    this.updatedAt = new Date()
    return this
  }

  /**
   * Checks if execution is in progress
   * @returns True if execution is in progress, false otherwise
   */
  public isInProgress(): boolean {
    return this._status === ServiceExecutionStatus.IN_PROGRESS
  }

  /**
   * Checks if execution is completed
   * @returns True if execution is completed, false otherwise
   */
  public isCompleted(): boolean {
    return this._status === ServiceExecutionStatus.COMPLETED
  }

  /**
   * Checks if execution is assigned
   * @returns True if execution is assigned, false otherwise
   */
  public isAssigned(): boolean {
    return this._status === ServiceExecutionStatus.ASSIGNED
  }

  /**
   * Calculates execution duration in minutes
   * @returns Duration in minutes or null if start/end time not available
   */
  public getDurationInMinutes(): number | null {
    if (!this._startTime || !this._endTime) {
      return null
    }
    return Math.round((this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60))
  }
}
