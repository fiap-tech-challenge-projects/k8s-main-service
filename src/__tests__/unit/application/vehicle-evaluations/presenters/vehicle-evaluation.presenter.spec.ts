import { VehicleEvaluationPresenter } from '@application/vehicle-evaluations/presenters'

describe('VehicleEvaluationPresenter', () => {
  it('present maps fields and formats dates to ISO strings', () => {
    const presenter = new VehicleEvaluationPresenter()

    const dto: any = {
      id: 've1',
      details: { score: 90 },
      evaluationDate: new Date('2023-03-01T10:00:00.000Z'),
      mechanicNotes: 'All good',
      serviceOrderId: 'so1',
      vehicleId: 'v1',
      createdAt: new Date('2023-03-01T10:00:00.000Z'),
      updatedAt: new Date('2023-03-02T10:00:00.000Z'),
    }

    const res = presenter.present(dto)

    expect(res.id).toBe('ve1')
    expect(res.details).toEqual({ score: 90 })
    expect(res.evaluationDate).toBe(dto.evaluationDate.toISOString())
    expect(res.mechanicNotes).toBe('All good')
    expect(res.serviceOrderId).toBe('so1')
    expect(res.vehicleId).toBe('v1')
    expect(res.createdAt).toBe(dto.createdAt.toISOString())
    expect(res.updatedAt).toBe(dto.updatedAt.toISOString())
  })

  it('presentPaginatedVehicleEvaluations delegates to presentPaginated and returns paginated shape', () => {
    const presenter = new VehicleEvaluationPresenter()

    const items = [
      {
        id: 've1',
        details: { score: 90 },
        evaluationDate: new Date(),
        serviceOrderId: 'so1',
        vehicleId: 'v1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const paginated = {
      data: items,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    const out = presenter.presentPaginatedVehicleEvaluations(paginated as any) as any

    expect(out.meta.page).toBe(1)
    expect(out.data).toHaveLength(1)
    expect(out.data[0].id).toBe('ve1')
  })
})
