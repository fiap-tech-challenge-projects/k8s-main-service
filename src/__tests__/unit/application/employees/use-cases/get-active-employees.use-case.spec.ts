import { GetActiveEmployeesUseCase } from '@application/employees'
import { EmployeeMapper } from '@application/employees/mappers'

describe('GetActiveEmployeesUseCase', () => {
  const mockRepo = { findActive: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new GetActiveEmployeesUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns paginated mapped employees on success', async () => {
    const repoResult = { data: [{ id: 'e-1' }], meta: { totalPages: 1 } }
    mockRepo.findActive.mockResolvedValue(repoResult)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-1' } as any)

    const res = await useCase.execute(1, 10)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data).toHaveLength(1)
  })

  it('returns failure when repo throws', async () => {
    mockRepo.findActive.mockRejectedValue(new Error('db'))

    const res = await useCase.execute()

    expect(res.isFailure).toBe(true)
  })
})
