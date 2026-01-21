import { ClientPresenter } from '@application/clients/presenters'

describe('ClientPresenter (unit)', () => {
  const presenter = new ClientPresenter()

  it('present formats client and dates', () => {
    const now = new Date('2020-01-01T00:00:00.000Z')
    const dto: any = {
      id: 'c1',
      name: 'C',
      email: 'c@c',
      cpfCnpj: '123',
      phone: '11',
      address: 'addr',
      createdAt: now,
      updatedAt: now,
    }

    const out = presenter.present(dto)

    expect(out).toEqual({
      id: 'c1',
      name: 'C',
      email: 'c@c',
      cpfCnpj: '123',
      phone: '11',
      address: 'addr',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
  })

  it('presentPaginatedClients delegates to presentPaginated', () => {
    const now = new Date('2020-01-01T00:00:00.000Z')
    const data: any = {
      data: [
        {
          id: 'c1',
          name: 'C',
          email: 'c@c',
          cpfCnpj: '123',
          phone: '11',
          address: 'addr',
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    const out = presenter.presentPaginatedClients(data)

    expect(out.data[0].id).toBe('c1')
    expect(out.meta.total).toBe(1)
  })
})
