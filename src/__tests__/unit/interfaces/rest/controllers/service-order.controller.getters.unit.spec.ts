import { ServiceOrderController } from '@interfaces/rest/controllers'

describe('ServiceOrderController getters (unit)', () => {
  let controller: ServiceOrderController
  let mockGetById: any
  let mockGetAll: any

  beforeEach(() => {
    mockGetById = { execute: jest.fn() }
    mockGetAll = { execute: jest.fn() }

    controller = new ServiceOrderController(
      {} as any,
      {} as any,
      mockGetById,
      mockGetAll,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('getById returns value when found', async () => {
    mockGetById.execute.mockResolvedValue({ isSuccess: true, value: { id: 'so-1' } })

    const out = await controller.getById('so-1')

    expect(mockGetById.execute).toHaveBeenCalledWith('so-1')
    expect(out).toEqual({ id: 'so-1' })
  })

  it('getById throws when not found', async () => {
    mockGetById.execute.mockResolvedValue({ isSuccess: false, error: new Error('not') })
    await expect(controller.getById('missing')).rejects.toBeDefined()
  })

  it('getAll returns paginated result when success', async () => {
    const pageResult = { data: [{ id: 'so-1' }], meta: { total: 1, totalPages: 1, page: 1 } }
    mockGetAll.execute.mockResolvedValue({ isSuccess: true, value: pageResult })

    const out = await controller.getAll(1, 10)

    expect(mockGetAll.execute).toHaveBeenCalledWith(1, 10)
    expect(out).toEqual(pageResult)
  })

  it('getAll throws when failure', async () => {
    mockGetAll.execute.mockResolvedValue({ isFailure: true, error: new Error('err') })
    await expect(controller.getAll()).rejects.toBeDefined()
  })
})
