import { ServicePresenter } from '@application/services/presenters'

describe('ServicePresenter', () => {
  it('present maps fields and uses updatedAt fallback when undefined', () => {
    const presenter = new ServicePresenter()
    const now = new Date('2020-01-01T00:00:00.000Z')
    const dto: any = {
      id: 'svc-1',
      name: 'Cleaning',
      description: 'desc',
      price: '100.00',
      estimatedDuration: '01:00',
      createdAt: now,
      updatedAt: undefined,
    }

    const out = presenter.present(dto)

    expect(out.id).toBe('svc-1')
    expect(out.createdAt).toBe(now.toISOString())
    // when updatedAt is undefined, fallback to createdAt
    expect(out.updatedAt).toBe(now.toISOString())
  })

  it('presentPaginatedServices delegates to BasePresenter.presentPaginated', () => {
    const presenter = new ServicePresenter()
    const now = new Date()
    const dto = {
      data: [
        {
          id: 'svc-1',
          name: 'S1',
          description: 'd',
          price: '10',
          estimatedDuration: '00:30',
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: {
        page: 2,
        limit: 1,
        total: 10,
        totalPages: 10,
      },
    } as any

    const out = presenter.presentPaginatedServices(dto)

    expect(out.meta.page).toBe(2)
    expect(Array.isArray(out.data)).toBe(true)
    expect(out.data[0].id).toBe('svc-1')
  })
})
