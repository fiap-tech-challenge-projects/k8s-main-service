import { BudgetStatus, DeliveryMethod } from '@prisma/client'

import {
  BudgetAlreadyApprovedException,
  BudgetAlreadyRejectedException,
  BudgetExpiredException,
  InvalidBudgetStatusException,
} from '@domain/budget/exceptions'
import { BaseEntity } from '@shared'
import { Price } from '@shared/value-objects'

/**
 * Budget entity representing a service budget in the mechanical workshop system
 */
export class Budget extends BaseEntity {
  private _status: BudgetStatus
  private _totalAmount: Price
  private _validityPeriod: number
  private readonly _generationDate: Date
  private _sentDate?: Date
  private _approvalDate?: Date
  private _rejectionDate?: Date
  private _deliveryMethod?: DeliveryMethod
  private _notes?: string
  private readonly _serviceOrderId: string
  private readonly _clientId: string

  /**
   * Constructor for Budget entity
   * @param id The unique identifier of the budget.
   * @param status The status of the budget.
   * @param totalAmount The total amount of the budget (value object).
   * @param validityPeriod The validity period of the budget (in days).
   * @param generationDate The date when the budget was generated.
   * @param serviceOrderId The ID of the associated service order.
   * @param clientId The ID of the client associated with the budget.
   * @param sentDate The date when the budget was sent (optional).
   * @param approvalDate The date when the budget was approved (optional).
   * @param rejectionDate The date when the budget was rejected (optional).
   * @param deliveryMethod The delivery method used (optional).
   * @param notes Additional notes for the budget (optional).
   * @param createdAt The creation date of the budget.
   * @param updatedAt The last update date of the budget.
   */
  constructor(
    id: string,
    status: BudgetStatus,
    totalAmount: Price,
    validityPeriod: number,
    generationDate: Date,
    serviceOrderId: string,
    clientId: string,
    sentDate?: Date,
    approvalDate?: Date,
    rejectionDate?: Date,
    deliveryMethod?: DeliveryMethod,
    notes?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(id, createdAt, updatedAt)
    this._status = status
    this._totalAmount = totalAmount
    this._validityPeriod = validityPeriod
    this._generationDate = generationDate
    this._sentDate = sentDate
    this._approvalDate = approvalDate
    this._rejectionDate = rejectionDate
    this._deliveryMethod = deliveryMethod
    this._notes = notes
    this._serviceOrderId = serviceOrderId
    this._clientId = clientId
  }

  // Getters for accessing private properties
  /**
   * Gets the budget status.
   * @returns The budget status
   */
  get status(): BudgetStatus {
    return this._status
  }

  /**
   * Gets the total amount of the budget.
   * @returns The total amount
   */
  get totalAmount(): Price {
    return this._totalAmount
  }

  /**
   * Gets the validity period of the budget.
   * @returns The validity period in days
   */
  get validityPeriod(): number {
    return this._validityPeriod
  }

  /**
   * Gets the generation date of the budget.
   * @returns The generation date
   */
  get generationDate(): Date {
    return this._generationDate
  }

  /**
   * Gets the sent date of the budget.
   * @returns The sent date or undefined if not sent
   */
  get sentDate(): Date | undefined {
    return this._sentDate
  }

  /**
   * Gets the approval date of the budget.
   * @returns The approval date or undefined if not approved
   */
  get approvalDate(): Date | undefined {
    return this._approvalDate
  }

  /**
   * Gets the rejection date of the budget.
   * @returns The rejection date or undefined if not rejected
   */
  get rejectionDate(): Date | undefined {
    return this._rejectionDate
  }

  /**
   * Gets the delivery method of the budget.
   * @returns The delivery method or undefined if not set
   */
  get deliveryMethod(): DeliveryMethod | undefined {
    return this._deliveryMethod
  }

  /**
   * Gets the notes of the budget.
   * @returns The notes or undefined if not set
   */
  get notes(): string | undefined {
    return this._notes
  }

  /**
   * Gets the service order ID associated with the budget.
   * @returns The service order ID
   */
  get serviceOrderId(): string {
    return this._serviceOrderId
  }

  /**
   * Gets the client ID associated with the budget.
   * @returns The client ID
   */
  get clientId(): string {
    return this._clientId
  }

  /**
   * Factory method to create a new Budget entity
   * @param serviceOrderId The ID of the associated service order.
   * @param clientId The ID of the client associated with the budget.
   * @param validityPeriod The validity period of the budget (in days).
   * @param deliveryMethod The delivery method used (optional).
   * @param notes Additional notes for the budget (optional).
   * @param status The status of the budget (default: GENERATED).
   * @param totalAmount The total amount of the budget (optional, will be calculated from budget items).
   * @returns A new instance of Budget.
   */
  public static create(
    serviceOrderId: string,
    clientId: string,
    validityPeriod: number,
    deliveryMethod?: DeliveryMethod,
    notes?: string,
    status: BudgetStatus = BudgetStatus.GENERATED,
    totalAmount?: string | number,
  ): Budget {
    const now = new Date()
    const calculatedTotalAmount =
      totalAmount !== undefined ? Price.create(totalAmount) : Price.create(0)

    return new Budget(
      `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status,
      calculatedTotalAmount,
      validityPeriod,
      now,
      serviceOrderId,
      clientId,
      undefined,
      undefined,
      undefined,
      deliveryMethod,
      notes,
      now,
      now,
    )
  }

  /**
   * Calculates the total amount from budget items
   * @param budgetItems Array of budget items to calculate total from
   * @returns Price value object representing the total amount
   */
  public static calculateTotalAmount(budgetItems: Array<{ totalPrice: Price }>): Price {
    const totalInCents = budgetItems.reduce((sum, item) => sum + item.totalPrice.getValue(), 0)
    return Price.create(totalInCents)
  }

  /**
   * Recalculates the total amount from budget items and updates the current entity
   * @param budgetItems Array of budget items to calculate total from
   * @returns The same Budget entity with recalculated total amount
   */
  public recalculateTotalAmount(budgetItems: Array<{ totalPrice: Price }>): Budget {
    const newTotalAmount = Budget.calculateTotalAmount(budgetItems)
    this._totalAmount = newTotalAmount
    this.updateTimestamp()
    return this
  }

  /**
   * Checks if the budget is expired
   * @returns True if the budget is expired, false otherwise
   */
  public isExpired(): boolean {
    const expirationDate = this.getExpirationDate()
    return new Date() > expirationDate
  }

  /**
   * Gets the expiration date of the budget
   * @returns The expiration date
   */
  public getExpirationDate(): Date {
    const expirationDate = new Date(this._generationDate)
    expirationDate.setDate(expirationDate.getDate() + this._validityPeriod)
    return expirationDate
  }

  /**
   * Updates the timestamp to current time.
   */
  private updateTimestamp(): void {
    this.updatedAt = new Date()
  }

  /**
   * Updates the budget status
   * @param status The new status
   */
  public updateStatus(status: BudgetStatus): void {
    if (status !== this._status) {
      this._status = status
      this.updateTimestamp()
    }
  }

  /**
   * Updates the total amount
   * @param totalAmount The new total amount (string or number)
   */
  public updateTotalAmount(totalAmount: string | number): void {
    this._totalAmount = Price.create(totalAmount)
    this.updateTimestamp()
  }

  /**
   * Updates the validity period
   * @param validityPeriod The new validity period
   */
  public updateValidityPeriod(validityPeriod: number): void {
    this._validityPeriod = validityPeriod
    this.updateTimestamp()
  }

  /**
   * Updates the sent date
   * @param sentDate The new sent date
   */
  public updateSentDate(sentDate: Date): void {
    this._sentDate = sentDate
    this.updateTimestamp()
  }

  /**
   * Updates the approval date
   * @param approvalDate The new approval date
   */
  public updateApprovalDate(approvalDate: Date): void {
    this._approvalDate = approvalDate
    this.updateTimestamp()
  }

  /**
   * Updates the rejection date
   * @param rejectionDate The new rejection date
   */
  public updateRejectionDate(rejectionDate: Date): void {
    this._rejectionDate = rejectionDate
    this.updateTimestamp()
  }

  /**
   * Updates the delivery method
   * @param deliveryMethod The new delivery method
   */
  public updateDeliveryMethod(deliveryMethod: DeliveryMethod): void {
    this._deliveryMethod = deliveryMethod
    this.updateTimestamp()
  }

  /**
   * Updates the notes
   * @param notes The new notes
   */
  public updateNotes(notes: string): void {
    this._notes = notes
    this.updateTimestamp()
  }

  /**
   * Approves the budget
   */
  public approve(): void {
    if (this._status === BudgetStatus.APPROVED) {
      throw new BudgetAlreadyApprovedException(this.id)
    }

    if (this.isExpired()) {
      throw new BudgetExpiredException(this.id, this.getExpirationDate())
    }

    this._status = BudgetStatus.APPROVED
    this._approvalDate = new Date()
    this.updateTimestamp()
  }

  /**
   * Rejects the budget
   */
  public reject(): void {
    if (this._status === BudgetStatus.REJECTED) {
      throw new BudgetAlreadyRejectedException(this.id)
    }

    if (this.isExpired()) {
      throw new BudgetExpiredException(this.id, this.getExpirationDate())
    }

    this._status = BudgetStatus.REJECTED
    this._rejectionDate = new Date()
    this.updateTimestamp()
  }

  /**
   * Sends the budget
   */
  public send(): void {
    const validTransitions: BudgetStatus[] = [BudgetStatus.GENERATED]

    if (!validTransitions.includes(this._status)) {
      throw new InvalidBudgetStatusException(this.id, this._status, BudgetStatus.SENT)
    }

    this._status = BudgetStatus.SENT
    this._sentDate = new Date()
    this.updateTimestamp()
  }

  /**
   * Marks the budget as received
   */
  public markAsReceived(): void {
    this._status = BudgetStatus.RECEIVED
    this.updateTimestamp()
  }

  /**
   * Marks the budget as expired
   */
  public markAsExpired(): void {
    this._status = BudgetStatus.EXPIRED
    this.updateTimestamp()
  }

  /**
   * Returns the total amount formatted as a string in Brazilian Real currency format.
   * @returns The formatted total amount string
   */
  public getFormattedTotalAmount(): string {
    return this._totalAmount.getFormatted()
  }
}
