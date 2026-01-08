import { BudgetItemType } from '@prisma/client'

import { BaseEntity } from '@shared/bases'
import { Price } from '@shared/value-objects'

/**
 * Represents an item within a budget, such as a part or a service.
 * Includes type, description, quantity, unit price, and optional references to related entities.
 */
export class BudgetItem extends BaseEntity {
  private _type: BudgetItemType
  private _description: string
  private _quantity: number
  private _unitPrice: Price
  private _totalPrice: Price
  private readonly _budgetId: string
  private _notes?: string
  private _stockItemId?: string
  private _serviceId?: string

  /**
   * Creates a new BudgetItem instance.
   *
   * @param id - The unique identifier of the budget item
   * @param type - The type of the budget item (e.g., 'SERVICE', 'PART')
   * @param description - A detailed description of the budget item
   * @param quantity - The quantity of the item
   * @param unitPrice - The unit price of the item
   * @param budgetId - The ID of the budget this item belongs to
   * @param notes - Optional notes about the budget item
   * @param stockItemId - Optional reference to a stock item
   * @param serviceId - Optional reference to a service
   * @param createdAt - The creation timestamp
   * @param updatedAt - The last update timestamp
   */
  constructor(
    id: string,
    type: BudgetItemType,
    description: string,
    quantity: number,
    unitPrice: Price,
    budgetId: string,
    notes?: string,
    stockItemId?: string,
    serviceId?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt ?? new Date(), updatedAt ?? new Date())

    this._type = type
    this._description = description
    this._quantity = quantity
    this._unitPrice = unitPrice
    this._totalPrice = Price.create(unitPrice.getValue() * quantity)
    this._budgetId = budgetId
    this._notes = notes
    this._stockItemId = stockItemId
    this._serviceId = serviceId
  }

  // Getters for accessing private properties
  /**
   * Gets the type of this budget item.
   * @returns The budget item type
   */
  get type(): BudgetItemType {
    return this._type
  }

  /**
   * Gets the description of this budget item.
   * @returns The description
   */
  get description(): string {
    return this._description
  }

  /**
   * Gets the quantity of this budget item.
   * @returns The quantity
   */
  get quantity(): number {
    return this._quantity
  }

  /**
   * Gets the unit price of this budget item.
   * @returns The unit price
   */
  get unitPrice(): Price {
    return this._unitPrice
  }

  /**
   * Gets the total price of this budget item.
   * @returns The total price
   */
  get totalPrice(): Price {
    return this._totalPrice
  }

  /**
   * Gets the budget ID this item belongs to.
   * @returns The budget ID
   */
  get budgetId(): string {
    return this._budgetId
  }

  /**
   * Gets the notes of this budget item.
   * @returns The notes or undefined if not set
   */
  get notes(): string | undefined {
    return this._notes
  }

  /**
   * Gets the stock item ID reference.
   * @returns The stock item ID or undefined if not set
   */
  get stockItemId(): string | undefined {
    return this._stockItemId
  }

  /**
   * Gets the service ID reference.
   * @returns The service ID or undefined if not set
   */
  get serviceId(): string | undefined {
    return this._serviceId
  }

  /**
   * Creates a new BudgetItem instance with default values.
   *
   * @param type - The type of the budget item
   * @param description - A detailed description of the budget item
   * @param quantity - The quantity of the item
   * @param unitPrice - The unit price of the item as a string
   * @param budgetId - The ID of the budget this item belongs to
   * @param notes - Optional notes about the budget item
   * @param stockItemId - Optional reference to a stock item
   * @param serviceId - Optional reference to a service
   * @returns A new BudgetItem instance
   */
  static create(
    type: BudgetItemType,
    description: string,
    quantity: number,
    unitPrice: string,
    budgetId: string,
    notes?: string,
    stockItemId?: string,
    serviceId?: string,
  ): BudgetItem {
    const unitPriceValueObject = Price.create(unitPrice)
    return new BudgetItem(
      '',
      type,
      description,
      quantity,
      unitPriceValueObject,
      budgetId,
      notes,
      stockItemId,
      serviceId,
    )
  }

  /**
   * Updates the type of this budget item.
   * @param type - The new type
   */
  updateType(type: BudgetItemType): void {
    this._type = type
    this.updatedAt = new Date()
  }

  /**
   * Updates the description of this budget item.
   * @param description - The new description
   */
  updateDescription(description: string): void {
    this._description = description
    this.updatedAt = new Date()
  }

  /**
   * Updates the quantity of this budget item and recalculates total price.
   * @param quantity - The new quantity
   */
  updateQuantity(quantity: number): void {
    this._quantity = quantity
    this._totalPrice = Price.create(this._unitPrice.getValue() * quantity)
    this.updatedAt = new Date()
  }

  /**
   * Updates the unit price of this budget item and recalculates total price.
   * @param unitPrice - The new unit price as a string
   */
  updateUnitPrice(unitPrice: string): void {
    this._unitPrice = Price.create(unitPrice)
    this._totalPrice = Price.create(this._unitPrice.getValue() * this._quantity)
    this.updatedAt = new Date()
  }

  /**
   * Updates the notes of this budget item.
   * @param notes - The new notes
   */
  updateNotes(notes?: string): void {
    this._notes = notes
    this.updatedAt = new Date()
  }

  /**
   * Updates the stock item reference of this budget item.
   * @param stockItemId - The new stock item ID
   */
  updateStockItemId(stockItemId?: string): void {
    this._stockItemId = stockItemId
    this.updatedAt = new Date()
  }

  /**
   * Updates the service reference of this budget item.
   * @param serviceId - The new service ID
   */
  updateServiceId(serviceId?: string): void {
    this._serviceId = serviceId
    this.updatedAt = new Date()
  }

  /**
   * Returns the unit price formatted as a string in Brazilian Real currency format.
   * @returns The formatted unit price string
   */
  public getFormattedUnitPrice(): string {
    return this._unitPrice.getFormatted()
  }

  /**
   * Returns the total price formatted as a string in Brazilian Real currency format.
   * @returns The formatted total price string
   */
  public getFormattedTotalPrice(): string {
    return this._totalPrice.getFormatted()
  }
}
