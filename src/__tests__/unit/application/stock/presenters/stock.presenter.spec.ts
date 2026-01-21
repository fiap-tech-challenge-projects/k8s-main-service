import { StockPresenter } from '@application/stock/presenters'

describe('StockPresenter', () => {
  it('present maps fields and formats dates to ISO strings', () => {
    const presenter = new StockPresenter()

    const dto: any = {
      id: 's1',
      name: 'Widget',
      sku: 'W-1',
      currentStock: 10,
      minStockLevel: 2,
      unitCost: '5.00',
      unitSalePrice: '10.00',
      description: 'a widget',
      supplier: 'Acme',
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: new Date('2020-01-02T00:00:00.000Z'),
    }

    const result = presenter.present(dto)

    expect(result.id).toBe('s1')
    expect(result.name).toBe('Widget')
    expect(result.unitCost).toBe('5.00')
    expect(result.createdAt).toBe(dto.createdAt.toISOString())
    expect(result.updatedAt).toBe(dto.updatedAt.toISOString())
  })

  it('presentPaginatedStockItems delegates to presentPaginated and returns paginated shape', () => {
    const presenter = new StockPresenter()

    const items = [
      {
        id: 's1',
        name: 'Widget',
        sku: 'W-1',
        currentStock: 10,
        minStockLevel: 2,
        unitCost: '5.00',
        unitSalePrice: '10.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const paginated = {
      data: items,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    const res = presenter.presentPaginatedStockItems(paginated as any)

    expect(res.meta.page).toBe(1)
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBe('s1')
  })
})
