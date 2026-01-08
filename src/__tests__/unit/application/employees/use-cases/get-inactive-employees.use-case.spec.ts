import { GetInactiveEmployeesUseCase } from '@application/employees'
import { EmployeeMapper } from '@application/employees/mappers'

describe('GetInactiveEmployeesUseCase', () => {
  const mockRepo = { findInactive: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new GetInactiveEmployeesUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns paginated mapped employees on success', async () => {
    const repoResult = { data: [{ id: 'e-1' }], meta: { totalPages: 1, total: 1 } }
    mockRepo.findInactive.mockResolvedValue(repoResult)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-1' } as any)

    const res = await useCase.execute(1, 10)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data).toHaveLength(1)
  })

  it('returns failure when repo throws', async () => {
    mockRepo.findInactive.mockRejectedValue(new Error('db'))

    const res = await useCase.execute()

    expect(res.isFailure).toBe(true)
  })
})
