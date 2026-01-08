import { InvalidPriceMarginException, InvalidSkuFormatException } from '@domain/stock/exceptions'
import { StockItemValidator } from '@domain/stock/validators'

describe('StockItemValidator', () => {
  it('basic SKU and numeric validations', () => {
    expect(StockItemValidator.isValidSku('ABC-123')).toBe(true)
    expect(StockItemValidator.isValidSku('ab')).toBe(false)
    expect(StockItemValidator.isValidQuantity(0)).toBe(true)
    expect(StockItemValidator.isValidQuantity(-1)).toBe(false)
    expect(StockItemValidator.isValidPriceMargin(10, 9)).toBe(false)
  })

  it('validateStockItemData throws for invalid entries', () => {
    expect(() =>
      StockItemValidator.validateStockItemData({
        name: 'A',
        sku: 'ABC-1',
        currentStock: 1,
        minStockLevel: 0,
        unitCost: 1,
        unitSalePrice: 2,
      } as any),
    ).toThrow()

    expect(() =>
      StockItemValidator.validateStockItemData({
        name: 'Name',
        sku: '!!bad',
        currentStock: 1,
        minStockLevel: 0,
        unitCost: 1,
        unitSalePrice: 2,
      } as any),
    ).toThrow(InvalidSkuFormatException)

    expect(() =>
      StockItemValidator.validateStockItemData({
        name: 'Name',
        sku: 'ABC-1',
        currentStock: 1,
        minStockLevel: 0,
        unitCost: 10,
        unitSalePrice: 5,
      } as any),
    ).toThrow(InvalidPriceMarginException)
  })
})
