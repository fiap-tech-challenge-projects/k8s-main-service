import { UserRole } from '@prisma/client'

import { SearchEmployeesByRoleUseCase } from '@application/employees'
import { EmployeeMapper } from '@application/employees/mappers'

describe('SearchEmployeesByRoleUseCase', () => {
  const mockRepo = { findByRole: jest.fn() }
  const mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }
  const useCase = new SearchEmployeesByRoleUseCase(mockRepo as any, mockUserContext as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns paginated results for a role', async () => {
    const repoResult = { data: [{ id: 'e-1' }], meta: { total: 1, totalPages: 1 } }
    mockRepo.findByRole.mockResolvedValue(repoResult)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-1' } as any)

    const res = await useCase.execute(UserRole.ADMIN, 1, 10)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.meta.total).toBe(1)
  })

  it('returns failure when repo throws', async () => {
    mockRepo.findByRole.mockRejectedValue(new Error('db'))

    const res = await useCase.execute(UserRole.ADMIN)

    expect(res.isFailure).toBe(true)
  })
})
