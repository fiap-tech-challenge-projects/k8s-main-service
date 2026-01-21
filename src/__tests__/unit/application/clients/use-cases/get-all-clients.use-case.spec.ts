import { ClientMapper } from '@application/clients/mappers'
import { GetAllClientsUseCase } from '@application/clients/use-cases'

describe('GetAllClientsUseCase', () => {
  let mockRepo: any
  let mockUserCtx: any
  let useCase: GetAllClientsUseCase

  beforeEach(() => {
    mockRepo = { findAll: jest.fn() }
    mockUserCtx = { getUserId: jest.fn().mockReturnValue('u-1') }
    jest
      .spyOn(ClientMapper, 'toResponseDtoArray')
      .mockImplementation((arr: any[]) => arr.map((a) => ({ id: a.id })) as any)
    useCase = new GetAllClientsUseCase(mockRepo, mockUserCtx)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when repository returns clients', async () => {
    mockRepo.findAll.mockResolvedValue({
      data: [{ id: 'c-1' }],
      meta: { page: 1, total: 1, totalPages: 1 },
    })

    const res = await useCase.execute(1, 10)

    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.value.data).toEqual([{ id: 'c-1' }])
  })

  it('returns Failure when repository throws', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('db'))

    const res = await useCase.execute()

    expect(res.isFailure).toBeTruthy()
  })
})
