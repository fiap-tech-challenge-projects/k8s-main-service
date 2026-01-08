import { GetAllServicesUseCase } from '@application/services'
import { ServiceMapper } from '@application/services/mappers'

describe('GetAllServicesUseCase', () => {
  const mockRepo = { findAll: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new GetAllServicesUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns mapped services on success', async () => {
    const repoResult = { data: [{ id: 's-1' }], meta: { totalPages: 1 } }
    mockRepo.findAll.mockResolvedValue(repoResult)
    jest.spyOn(ServiceMapper, 'toResponseDto').mockReturnValue({ id: 's-1' } as any)

    const res = await useCase.execute(1, 10)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data).toHaveLength(1)
  })

  it('returns failure when repo throws', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('db'))

    const res = await useCase.execute()

    expect(res.isFailure).toBe(true)
  })
})
