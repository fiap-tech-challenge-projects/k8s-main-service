import { StockItem } from '@domain/stock/entities'
import { Price } from '@shared/value-objects'

/**
 * Factory for creating StockItem entities for testing
 */
export class StockItemFactory {
  /**
   * Create a valid StockItem entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns StockItem entity
   */
  public static create(
    overrides: Partial<{
      id: string
      name: string
      sku: string
      currentStock: number
      minStockLevel: number
      unitCost: string
      unitSalePrice: string
      description?: string
      supplier?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): StockItem {
    const defaults = {
      id: `STOCK-ITEM-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: 'Filtro de Óleo',
      sku: 'FLT-001',
      currentStock: 15,
      minStockLevel: 5,
      unitCost: '25.00',
      unitSalePrice: '50.00',
      description: 'Filtro de óleo automotivo de alta qualidade',
      supplier: 'Bosch',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new StockItem(
      data.id,
      data.name,
      data.sku,
      data.currentStock,
      data.minStockLevel,
      Price.create(data.unitCost),
      Price.create(data.unitSalePrice),
      data.description,
      data.supplier,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a minimal StockItem entity with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns StockItem entity
   */
  public static createMinimal(
    overrides: Partial<{
      id: string
      name: string
      sku: string
      currentStock: number
      minStockLevel: number
      unitCost: string
      unitSalePrice: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): StockItem {
    const defaults = {
      id: `stock-item-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Pneu',
      sku: 'PNE-002',
      currentStock: 20,
      minStockLevel: 3,
      unitCost: '200.00',
      unitSalePrice: '300.00',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new StockItem(
      data.id,
      data.name,
      data.sku,
      data.currentStock,
      data.minStockLevel,
      Price.create(data.unitCost),
      Price.create(data.unitSalePrice),
      undefined,
      undefined,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a StockItem entity with low stock
   * @param overrides - Optional properties to override defaults
   * @returns StockItem entity
   */
  public static createWithLowStock(
    overrides: Partial<{
      id: string
      name: string
      sku: string
      currentStock: number
      minStockLevel: number
      unitCost: string
      unitSalePrice: string
      description?: string
      supplier?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): StockItem {
    const defaults = {
      id: `stock-item-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Pastilha de Freio',
      sku: 'PST-003',
      currentStock: 2,
      minStockLevel: 5,
      unitCost: '35.00',
      unitSalePrice: '70.00',
      description: 'Pastilha de freio cerâmica',
      supplier: 'Brembo',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new StockItem(
      data.id,
      data.name,
      data.sku,
      data.currentStock,
      data.minStockLevel,
      Price.create(data.unitCost),
      Price.create(data.unitSalePrice),
      data.description,
      data.supplier,
      data.createdAt,
      data.updatedAt,
    )
  }
}
