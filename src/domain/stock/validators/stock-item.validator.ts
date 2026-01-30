import { InvalidPriceMarginException, InvalidSkuFormatException } from '@domain/stock/exceptions'

/**
 * Validator for stock item related operations
 */
export class StockItemValidator {
  /**
   * Validates if an SKU is valid format
   * @param sku - The SKU to validate
   * @returns True if SKU is valid, false otherwise
   */
  public static isValidSku(sku: string): boolean {
    if (!sku || sku.trim().length === 0) {
      return false
    }

    // SKU should be alphanumeric with optional hyphens, between 3 and 20 characters
    const skuPattern = /^[A-Z0-9-]{3,20}$/
    return skuPattern.test(sku.trim().toUpperCase())
  }

  /**
   * Validates if quantity is valid
   * @param quantity - The quantity to validate
   * @returns True if quantity is valid, false otherwise
   */
  public static isValidQuantity(quantity: number): boolean {
    return quantity >= 0 && Number.isInteger(quantity)
  }

  /**
   * Validates if current stock is sufficient for requested quantity
   * @param currentStock - The current stock level
   * @param requestedQuantity - The requested quantity
   * @returns True if stock is sufficient, false otherwise
   */
  public static hasSufficientStock(currentStock: number, requestedQuantity: number): boolean {
    return currentStock >= requestedQuantity
  }

  /**
   * Validates if minimum stock level is reasonable
   * @param minStockLevel - The minimum stock level to validate
   * @returns True if minimum stock level is valid, false otherwise
   */
  public static isValidMinStockLevel(minStockLevel: number): boolean {
    return minStockLevel >= 0 && Number.isInteger(minStockLevel)
  }

  /**
   * Validates if unit cost is valid
   * @param unitCost - The unit cost to validate
   * @returns True if unit cost is valid, false otherwise
   */
  public static isValidUnitCost(unitCost: number): boolean {
    return unitCost >= 0 && Number.isFinite(unitCost)
  }

  /**
   * Validates if unit sale price is valid
   * @param unitSalePrice - The unit sale price to validate
   * @returns True if unit sale price is valid, false otherwise
   */
  public static isValidUnitSalePrice(unitSalePrice: number): boolean {
    return unitSalePrice >= 0 && Number.isFinite(unitSalePrice)
  }

  /**
   * Validates if sale price is greater than or equal to cost price
   * @param unitCost - The unit cost
   * @param unitSalePrice - The unit sale price
   * @returns True if sale price is reasonable, false otherwise
   */
  public static isValidPriceMargin(unitCost: number, unitSalePrice: number): boolean {
    return unitSalePrice >= unitCost
  }

  /**
   * Validates if stock item name is valid
   * @param name - The name to validate
   * @returns True if name is valid, false otherwise
   */
  public static isValidName(name: string): boolean {
    return Boolean(name && name.trim().length >= 2 && name.trim().length <= 100)
  }

  /**
   * Validates if description is valid
   * @param description - The description to validate
   * @returns True if description is valid, false otherwise
   */
  public static isValidDescription(description?: string): boolean {
    if (!description) return true
    return description.trim().length <= 500
  }

  /**
   * Validates if supplier name is valid
   * @param supplier - The supplier name to validate
   * @returns True if supplier is valid, false otherwise
   */
  public static isValidSupplier(supplier?: string): boolean {
    if (!supplier) return true
    return supplier.trim().length >= 2 && supplier.trim().length <= 100
  }

  /**
   * Validates if the stock item is below minimum stock level
   * @param currentStock - The current stock level
   * @param minStockLevel - The minimum stock level
   * @returns True if stock is below minimum, false otherwise
   */
  public static isBelowMinimumStock(currentStock: number, minStockLevel: number): boolean {
    return currentStock < minStockLevel
  }

  /**
   * Validates all stock item data
   * @param data - Object containing all stock item data to validate
   * @param data.name - Item name
   * @param data.sku - Item SKU
   * @param data.currentStock - Current stock quantity
   * @param data.minStockLevel - Minimum stock level
   * @param data.unitCost - Unit cost
   * @param data.unitSalePrice - Unit sale price
   * @param data.description - Optional description
   * @param data.supplier - Optional supplier
   * @throws Error if any validation fails
   */
  public static validateStockItemData(data: {
    name: string
    sku: string
    currentStock: number
    minStockLevel: number
    unitCost: number
    unitSalePrice: number
    description?: string
    supplier?: string
  }): void {
    if (!this.isValidName(data.name)) {
      throw new Error('Invalid stock item name: must be between 2 and 100 characters')
    }

    if (!this.isValidSku(data.sku)) {
      throw new InvalidSkuFormatException(data.sku)
    }

    if (!this.isValidQuantity(data.currentStock)) {
      throw new Error('Invalid current stock: must be a non-negative integer')
    }

    if (!this.isValidMinStockLevel(data.minStockLevel)) {
      throw new Error('Invalid minimum stock level: must be a non-negative integer')
    }

    if (!this.isValidUnitCost(data.unitCost)) {
      throw new Error('Invalid unit cost: must be a non-negative number')
    }

    if (!this.isValidUnitSalePrice(data.unitSalePrice)) {
      throw new Error('Invalid unit sale price: must be a non-negative number')
    }

    if (!this.isValidPriceMargin(data.unitCost, data.unitSalePrice)) {
      throw new InvalidPriceMarginException(data.unitCost, data.unitSalePrice)
    }

    if (!this.isValidDescription(data.description)) {
      throw new Error('Invalid description: must not exceed 500 characters')
    }

    if (!this.isValidSupplier(data.supplier)) {
      throw new Error('Invalid supplier: must be between 2 and 100 characters')
    }
  }
}
