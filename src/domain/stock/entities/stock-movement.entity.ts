import { StockMovementType } from '@prisma/client'

import { StockMovementValidator } from '@domain/stock/validators'
import { BaseEntity } from '@shared'

/**
 * Domain entity representing a stock movement record
 */
export class StockMovement extends BaseEntity {
  private _type: StockMovementType
  private _quantity: number
  private _movementDate: Date
  private _reason?: string
  private _notes?: string
  private readonly _stockId: string

  /**
   * Constructor for StockMovement entity
   * @param id - Unique identifier
   * @param type - Type of stock movement
   * @param quantity - Quantity involved in the movement
   * @param movementDate - Date when the movement occurred
   * @param stockId - ID of the stock item being moved
   * @param reason - Optional reason for the movement
   * @param notes - Optional additional notes
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  constructor(
    id: string,
    type: StockMovementType,
    quantity: number,
    movementDate: Date,
    stockId: string,
    reason?: string,
    notes?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt ?? new Date(), updatedAt ?? new Date())

    // Validate data before assignment (we'll need current stock for validation, skip for now in constructor)
    if (!StockMovementValidator.isValidMovementType(type)) {
      throw new Error('Invalid movement type')
    }
    if (!StockMovementValidator.isValidQuantity(quantity)) {
      throw new Error('Invalid quantity: must be a positive integer')
    }
    if (!StockMovementValidator.isValidMovementDate(movementDate)) {
      throw new Error('Invalid movement date: must be within reasonable range')
    }
    if (!StockMovementValidator.isValidStockId(stockId)) {
      throw new Error('Invalid stock ID: cannot be empty')
    }
    if (!StockMovementValidator.isValidReason(reason)) {
      throw new Error('Invalid reason: must not exceed 200 characters')
    }
    if (!StockMovementValidator.isValidNotes(notes)) {
      throw new Error('Invalid notes: must not exceed 500 characters')
    }

    this._type = type
    this._quantity = quantity
    this._movementDate = movementDate
    this._stockId = stockId
    this._reason = reason
    this._notes = notes
  }

  // Getters for accessing private properties
  /**
   * Gets the movement type.
   * @returns The movement type
   */
  get type(): StockMovementType {
    return this._type
  }

  /**
   * Gets the movement quantity.
   * @returns The movement quantity
   */
  get quantity(): number {
    return this._quantity
  }

  /**
   * Gets the movement date.
   * @returns The movement date
   */
  get movementDate(): Date {
    return this._movementDate
  }

  /**
   * Gets the movement reason.
   * @returns The movement reason or undefined if not set
   */
  get reason(): string | undefined {
    return this._reason
  }

  /**
   * Gets the movement notes.
   * @returns The movement notes or undefined if not set
   */
  get notes(): string | undefined {
    return this._notes
  }

  /**
   * Gets the stock ID.
   * @returns The stock ID
   */
  get stockId(): string {
    return this._stockId
  }

  /**
   * Create a new StockMovement entity
   * @param type - Type of stock movement
   * @param quantity - Quantity involved in the movement
   * @param movementDate - Date when the movement occurred
   * @param stockId - ID of the stock item being moved
   * @param reason - Optional reason for the movement
   * @param notes - Optional additional notes
   * @returns New StockMovement entity
   */
  public static create(
    type: StockMovementType,
    quantity: number,
    movementDate: Date,
    stockId: string,
    reason?: string,
    notes?: string,
  ): StockMovement {
    const now = new Date()
    const id = `stock-movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return new StockMovement(id, type, quantity, movementDate, stockId, reason, notes, now, now)
  }

  /**
   * Updates the type of the stock movement.
   * @param type - The new movement type
   */
  updateType(type: StockMovementType): void {
    if (!StockMovementValidator.isValidMovementType(type)) {
      throw new Error('Invalid movement type')
    }
    this._type = type
    this.updateTimestamp()
  }

  /**
   * Updates the quantity of the stock movement.
   * @param quantity - The new quantity
   */
  updateQuantity(quantity: number): void {
    if (!StockMovementValidator.isValidQuantity(quantity)) {
      throw new Error('Invalid quantity: must be a positive integer')
    }
    this._quantity = quantity
    this.updateTimestamp()
  }

  /**
   * Updates the movement date.
   * @param movementDate - The new movement date
   */
  updateMovementDate(movementDate: Date): void {
    if (!StockMovementValidator.isValidMovementDate(movementDate)) {
      throw new Error('Invalid movement date: must be within reasonable range')
    }
    this._movementDate = movementDate
    this.updateTimestamp()
  }

  /**
   * Updates the reason for the movement.
   * @param reason - The new reason
   */
  updateReason(reason?: string): void {
    if (!StockMovementValidator.isValidReason(reason)) {
      throw new Error('Invalid reason: must not exceed 200 characters')
    }
    this._reason = reason
    this.updateTimestamp()
  }

  /**
   * Updates the notes for the movement.
   * @param notes - The new notes
   */
  updateNotes(notes?: string): void {
    if (!StockMovementValidator.isValidNotes(notes)) {
      throw new Error('Invalid notes: must not exceed 500 characters')
    }
    this._notes = notes
    this.updateTimestamp()
  }

  /**
   * Updates the timestamp to current time.
   */
  private updateTimestamp(): void {
    this.updatedAt = new Date()
  }

  /**
   * Check if this movement is an IN movement
   * @returns True if movement type is IN
   */
  public isInMovement(): boolean {
    return this._type === StockMovementType.IN
  }

  /**
   * Check if this movement is an OUT movement
   * @returns True if movement type is OUT
   */
  public isOutMovement(): boolean {
    return this._type === StockMovementType.OUT
  }

  /**
   * Check if this movement is an ADJUSTMENT movement
   * @returns True if movement type is ADJUSTMENT
   */
  public isAdjustmentMovement(): boolean {
    return this._type === StockMovementType.ADJUSTMENT
  }

  /**
   * Get the effective quantity change for stock calculation
   * @returns Positive number for IN movements, negative for OUT movements, actual quantity for ADJUSTMENT
   */
  public getEffectiveQuantity(): number {
    switch (this._type) {
      case StockMovementType.IN:
        return Math.abs(this._quantity)
      case StockMovementType.OUT:
        return -Math.abs(this._quantity)
      case StockMovementType.ADJUSTMENT:
        return this._quantity
      default:
        return 0
    }
  }
}
