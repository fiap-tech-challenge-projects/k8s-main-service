import { StockItemValidator } from '@domain/stock/validators'
import { BaseEntity } from '@shared/bases'
import { Price } from '@shared/value-objects'

/**
 * Stock item entity representing a stock item in the mechanical workshop system
 */
export class StockItem extends BaseEntity {
  private _name: string
  private readonly _sku: string
  private _currentStock: number
  private _minStockLevel: number
  private _unitCost: Price
  private _unitSalePrice: Price
  private _description?: string
  private _supplier?: string

  /**
   * Creates a new StockItem instance.
   *
   * @param id - Unique identifier
   * @param name - Item name
   * @param sku - Item SKU (Stock Keeping Unit)
   * @param currentStock - Current stock level
   * @param minStockLevel - Minimum stock level
   * @param unitCost - Unit cost
   * @param unitSalePrice - Unit sale price
   * @param description - Item description (optional)
   * @param supplier - Item supplier (optional)
   * @param createdAt - Creation date
   * @param updatedAt - Last update date
   * @param createdBy - ID of user who created this entity
   * @param createdAt - The creation timestamp
   * @param updatedAt - The last update timestamp
   */
  constructor(
    id: string,
    name: string,
    sku: string,
    currentStock: number,
    minStockLevel: number,
    unitCost: Price,
    unitSalePrice: Price,
    description: string | undefined,
    supplier: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt)

    // Validate data before assignment
    StockItemValidator.validateStockItemData({
      name,
      sku,
      currentStock,
      minStockLevel,
      unitCost: unitCost.getValue(),
      unitSalePrice: unitSalePrice.getValue(),
      description,
      supplier,
    })

    this._name = name
    this._sku = sku
    this._currentStock = currentStock
    this._minStockLevel = minStockLevel
    this._unitCost = unitCost
    this._unitSalePrice = unitSalePrice
    this._description = description
    this._supplier = supplier
  }

  // Getters for accessing private properties
  /**
   * Gets the stock item name.
   * @returns The item name
   */
  get name(): string {
    return this._name
  }

  /**
   * Gets the stock item SKU.
   * @returns The item SKU
   */
  get sku(): string {
    return this._sku
  }

  /**
   * Gets the current stock level.
   * @returns The current stock level
   */
  get currentStock(): number {
    return this._currentStock
  }

  /**
   * Gets the minimum stock level.
   * @returns The minimum stock level
   */
  get minStockLevel(): number {
    return this._minStockLevel
  }

  /**
   * Gets the unit cost.
   * @returns The unit cost
   */
  get unitCost(): Price {
    return this._unitCost
  }

  /**
   * Gets the unit sale price.
   * @returns The unit sale price
   */
  get unitSalePrice(): Price {
    return this._unitSalePrice
  }

  /**
   * Gets the item description.
   * @returns The item description or undefined if not set
   */
  get description(): string | undefined {
    return this._description
  }

  /**
   * Gets the item supplier.
   * @returns The item supplier or undefined if not set
   */
  get supplier(): string | undefined {
    return this._supplier
  }

  /**
   * Create a new StockItem instance
   * @param name - Stock item name
   * @param sku - Item SKU (Stock Keeping Unit)
   * @param currentStock - Current stock level
   * @param minStockLevel - Minimum stock level
   * @param unitCost - Unit cost as string
   * @param unitSalePrice - Unit sale price as string
   * @param description - Item description (optional)
   * @param supplier - Item supplier (optional)
   * @returns A new StockItem instance
   */
  public static create(
    name: string,
    sku: string,
    currentStock: number,
    minStockLevel: number,
    unitCost: string,
    unitSalePrice: string,
    description?: string,
    supplier?: string,
  ): StockItem {
    const unitCostPrice = Price.create(unitCost)
    const unitSalePriceValue = Price.create(unitSalePrice)
    const now = new Date()

    return new StockItem(
      '',
      name,
      sku,
      currentStock,
      minStockLevel,
      unitCostPrice,
      unitSalePriceValue,
      description,
      supplier,
      now,
      now,
    )
  }

  /**
   * Updates the name of the stock item.
   * @param name - The new name
   */
  updateName(name: string): void {
    if (!StockItemValidator.isValidName(name)) {
      throw new Error('Invalid stock item name: must be between 2 and 100 characters')
    }
    this._name = name
    this.updateTimestamp()
  }

  /**
   * Updates the current stock quantity.
   * @param currentStock - The new current stock
   */
  updateCurrentStock(currentStock: number): void {
    if (!StockItemValidator.isValidQuantity(currentStock)) {
      throw new Error('Invalid current stock: must be a non-negative integer')
    }
    this._currentStock = currentStock
    this.updateTimestamp()
  }

  /**
   * Updates the minimum stock level.
   * @param minStockLevel - The new minimum stock level
   */
  updateMinStockLevel(minStockLevel: number): void {
    if (!StockItemValidator.isValidMinStockLevel(minStockLevel)) {
      throw new Error('Invalid minimum stock level: must be a non-negative integer')
    }
    this._minStockLevel = minStockLevel
    this.updateTimestamp()
  }

  /**
   * Updates the unit cost.
   * @param unitCost - The new unit cost as string
   */
  updateUnitCost(unitCost: string): void {
    const unitCostPrice = Price.create(unitCost)
    if (!StockItemValidator.isValidUnitCost(unitCostPrice.getValue())) {
      throw new Error('Invalid unit cost: must be a non-negative number')
    }
    if (
      !StockItemValidator.isValidPriceMargin(
        unitCostPrice.getValue(),
        this._unitSalePrice.getValue(),
      )
    ) {
      throw new Error('Invalid price margin: sale price must be greater than or equal to cost')
    }
    this._unitCost = unitCostPrice
    this.updateTimestamp()
  }

  /**
   * Updates the unit sale price.
   * @param unitSalePrice - The new unit sale price as string
   */
  updateUnitSalePrice(unitSalePrice: string): void {
    const unitSalePriceValue = Price.create(unitSalePrice)
    if (!StockItemValidator.isValidUnitSalePrice(unitSalePriceValue.getValue())) {
      throw new Error('Invalid unit sale price: must be a non-negative number')
    }
    if (
      !StockItemValidator.isValidPriceMargin(
        this._unitCost.getValue(),
        unitSalePriceValue.getValue(),
      )
    ) {
      throw new Error('Invalid price margin: sale price must be greater than or equal to cost')
    }
    this._unitSalePrice = unitSalePriceValue
    this.updateTimestamp()
  }

  /**
   * Updates the description.
   * @param description - The new description
   */
  updateDescription(description: string | undefined): void {
    if (!StockItemValidator.isValidDescription(description)) {
      throw new Error('Invalid description: must not exceed 500 characters')
    }
    this._description = description
    this.updateTimestamp()
  }

  /**
   * Updates the supplier.
   * @param supplier - The new supplier
   */
  updateSupplier(supplier: string | undefined): void {
    if (!StockItemValidator.isValidSupplier(supplier)) {
      throw new Error('Invalid supplier: must be between 2 and 100 characters')
    }
    this._supplier = supplier
    this.updateTimestamp()
  }

  /**
   * Adjusts the current stock by a given quantity.
   * @param quantity - Quantity to adjust (positive for increase, negative for decrease)
   */
  adjustStock(quantity: number): void {
    const newStock = this._currentStock + quantity
    if (!StockItemValidator.isValidQuantity(newStock)) {
      throw new Error('Invalid stock adjustment: resulting stock cannot be negative')
    }
    this._currentStock = newStock
    this.updateTimestamp()
  }

  /**
   * Updates the timestamp to current time.
   */
  private updateTimestamp(): void {
    this.updatedAt = new Date()
  }

  /**
   * Check if the stock item has a specific SKU
   * @param sku - SKU to check
   * @returns True if the stock item has the specified SKU, false otherwise
   */
  public hasSku(sku: string): boolean {
    return this._sku === sku
  }

  /**
   * Check if the stock item has sufficient stock
   * @param quantity - Quantity to check
   * @returns True if the stock item has sufficient stock, false otherwise
   */
  public hasStock(quantity: number): boolean {
    return this.currentStock >= quantity
  }

  /**
   * Check if the stock item is below minimum stock level
   * @returns True if below minimum, false otherwise
   */
  public isBelowMinimumStock(): boolean {
    return this.currentStock < this.minStockLevel
  }

  /**
   * Get the stock deficit (how much below minimum stock)
   * @returns The deficit amount, or 0 if not below minimum
   */
  public getStockDeficit(): number {
    return Math.max(0, this.minStockLevel - this.currentStock)
  }

  /**
   * Calculate the profit margin percentage
   * @returns The profit margin as a percentage
   */
  public getProfitMarginPercentage(): number {
    if (this.unitCost.getValue() === 0) return 0
    return (
      ((this.unitSalePrice.getValue() - this.unitCost.getValue()) / this.unitCost.getValue()) * 100
    )
  }

  /**
   * Calculate the profit per unit
   * @returns The profit amount per unit
   */
  public getProfitPerUnit(): number {
    return this.unitSalePrice.getValue() - this.unitCost.getValue()
  }

  /**
   * Returns the unit cost formatted as a string in Brazilian Real currency format.
   * @returns The formatted unit cost string
   */
  public getFormattedUnitCost(): string {
    return this.unitCost.getFormatted()
  }

  /**
   * Returns the unit sale price formatted as a string in Brazilian Real currency format.
   * @returns The formatted unit sale price string
   */
  public getFormattedUnitSalePrice(): string {
    return this.unitSalePrice.getFormatted()
  }
}
