import { VehiclePresenter } from '@application/vehicles/presenters'

describe('VehiclePresenter', () => {
  it('present maps fields and formats dates to ISO strings', () => {
    const presenter = new VehiclePresenter()

    const dto: any = {
      id: 'v1',
      licensePlate: 'ABC-1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      vin: '1HGCM82633A004352',
      color: 'blue',
      clientId: 'c1',
      createdAt: new Date('2021-05-01T12:00:00.000Z'),
      updatedAt: new Date('2021-05-02T12:00:00.000Z'),
    }

    const res = presenter.present(dto)

    expect(res.id).toBe('v1')
    expect(res.licensePlate).toBe('ABC-1234')
    expect(res.make).toBe('Toyota')
    expect(res.year).toBe(2020)
    expect(res.createdAt).toBe(dto.createdAt.toISOString())
    expect(res.updatedAt).toBe(dto.updatedAt.toISOString())
  })

  it('presentPaginatedVehicles delegates to presentPaginated and returns paginated shape', () => {
    const presenter = new VehiclePresenter()

    const items = [
      {
        id: 'v1',
        licensePlate: 'ABC-1234',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        clientId: 'c1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const paginated = {
      data: items,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    const out = presenter.presentPaginatedVehicles(paginated as any)

    expect(out.meta.page).toBe(1)
    expect(out.data).toHaveLength(1)
    expect(out.data[0].id).toBe('v1')
  })
})
