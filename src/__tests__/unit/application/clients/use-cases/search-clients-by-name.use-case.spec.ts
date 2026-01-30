import { ClientMapper } from '@application/clients/mappers'
import { SearchClientsByNameUseCase } from '@application/clients/use-cases'

describe('SearchClientsByNameUseCase', () => {
  let mockRepo: any
  let mockUserCtx: any
  let useCase: SearchClientsByNameUseCase

  beforeEach(() => {
    mockRepo = { findByName: jest.fn() }
    mockUserCtx = { getUserId: jest.fn().mockReturnValue('u-1') }
    jest
      .spyOn(ClientMapper, 'toResponseDtoArray')
      .mockImplementation((arr: any[]) => arr.map((a) => ({ id: a.id })) as any)
    useCase = new SearchClientsByNameUseCase(mockRepo, mockUserCtx)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when repository returns clients', async () => {
    mockRepo.findByName.mockResolvedValue({
      data: [{ id: 'c-2' }],
      meta: { page: 1, total: 1, totalPages: 1 },
    })

    const res = await useCase.execute('Alice', 1, 10)

    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value.data).toEqual([{ id: 'c-2' }])
  })

  it('returns Failure when repository throws', async () => {
    mockRepo.findByName.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('Bob')

    expect(res.isFailure).toBeTruthy()
  })
})
