import { EmployeePresenter } from '@application/employees/presenters'

describe('EmployeePresenter', () => {
  it('present maps fields and formats dates to ISO strings', () => {
    const presenter = new EmployeePresenter()

    const dto: any = {
      id: 'e1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'mechanic',
      phone: '+5511999999999',
      specialty: null,
      isActive: true,
      createdAt: new Date('2022-01-01T00:00:00.000Z'),
      updatedAt: new Date('2022-01-02T00:00:00.000Z'),
    }

    const res = presenter.present(dto)

    expect(res.id).toBe('e1')
    expect(res.name).toBe('Alice')
    expect(res.email).toBe('alice@example.com')
    expect(res.role).toBe('mechanic')
    expect(res.phone).toBe('+5511999999999')
    expect(res.specialty).toBeNull()
    expect(res.isActive).toBe(true)
    expect(res.createdAt).toBe(dto.createdAt.toISOString())
    expect(res.updatedAt).toBe(dto.updatedAt.toISOString())
  })

  it('presentPaginatedEmployees delegates to presentPaginated and returns paginated shape', () => {
    const presenter = new EmployeePresenter()

    const items = [
      {
        id: 'e1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'mechanic',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const paginated = {
      data: items,
      meta: { page: 2, limit: 5, total: 10, totalPages: 2 },
    }

    const out = presenter.presentPaginatedEmployees(paginated as any)

    expect(out.meta.page).toBe(2)
    expect(out.data).toHaveLength(1)
    expect(out.data[0].id).toBe('e1')
  })
})
