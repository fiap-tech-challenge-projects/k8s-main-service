import { StockItemPresenter } from '@application/stock/presenters'

describe('StockItemPresenter', () => {
  it('present maps optional fields and formats dates', () => {
    const presenter = new StockItemPresenter()
    const now = new Date('2021-05-05T12:00:00.000Z')

    const dto: any = {
      id: 'st-1',
      name: 'Part',
      sku: 'SKU123',
      currentStock: 5,
      minStockLevel: 1,
      unitCost: '5.00',
      unitSalePrice: '10.00',
      description: 'desc',
      supplier: 'ACME',
      createdAt: now,
      updatedAt: now,
    }

    const out = presenter.present(dto)

    expect(out.id).toBe('st-1')
    expect(out.description).toBe('desc')
    expect(out.supplier).toBe('ACME')
    expect(out.createdAt).toBe(now.toISOString())
    expect(out.updatedAt).toBe(now.toISOString())
  })

  it('presentPaginatedStockItems delegates to BasePresenter.presentPaginated', () => {
    const presenter = new StockItemPresenter()
    const now = new Date()
    const paginated = {
      data: [
        {
          id: 'st-1',
          name: 'Part',
          sku: 'SKU123',
          currentStock: 2,
          minStockLevel: 1,
          unitCost: '1.00',
          unitSalePrice: '2.00',
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    } as any

    const out = presenter.presentPaginatedStockItems(paginated) as any

    expect(out.meta.page).toBe(1)
    expect(out.data[0].id).toBe('st-1')
  })
})
