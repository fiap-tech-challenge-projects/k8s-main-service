import { SearchEmployeesByNameUseCase } from '@application/employees'
import { EmployeeMapper } from '@application/employees/mappers'

describe('SearchEmployeesByNameUseCase', () => {
  const mockRepo = { findByName: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new SearchEmployeesByNameUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns paginated results when found', async () => {
    const repoResult = { data: [{ id: 'e-1' }], meta: { totalPages: 1 } }
    mockRepo.findByName.mockResolvedValue(repoResult)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-1' } as any)

    const res = await useCase.execute('Alice', 1, 10)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data[0].id).toBe('e-1')
  })

  it('returns failure when repo throws', async () => {
    mockRepo.findByName.mockRejectedValue(new Error('db'))

    const res = await useCase.execute('Bob')

    expect(res.isFailure).toBe(true)
  })
})
