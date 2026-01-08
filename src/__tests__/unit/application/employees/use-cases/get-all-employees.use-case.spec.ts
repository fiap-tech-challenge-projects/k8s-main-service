import { EmployeeMapper } from '@application/employees/mappers'
import { GetAllEmployeesUseCase } from '@application/employees/use-cases'

describe('GetAllEmployeesUseCase', () => {
  afterEach(() => jest.restoreAllMocks())

  it('returns all employees for ADMIN role', async () => {
    const repo = {
      findAll: jest.fn().mockResolvedValue({
        data: [{ id: 'e-1' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
      }),
      findById: jest.fn(),
    }
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-1' } as any)

    const useCase = new GetAllEmployeesUseCase(
      repo as any,
      { getUserId: () => 'u-1', getUserRole: () => 'ADMIN', getEmployeeId: () => undefined } as any,
    )
    const res = await useCase.execute(1, 10)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data[0].id).toBe('e-1')
    expect(repo.findAll).toHaveBeenCalledWith(1, 10)
  })

  it('returns employee only for EMPLOYEE role with employeeId', async () => {
    const repo = { findAll: jest.fn(), findById: jest.fn().mockResolvedValue({ id: 'e-2' }) }
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-2' } as any)

    const useCase = new GetAllEmployeesUseCase(
      repo as any,
      { getUserId: () => 'u-2', getUserRole: () => 'EMPLOYEE', getEmployeeId: () => 'e-2' } as any,
    )
    const res = await useCase.execute()

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data[0].id).toBe('e-2')
  })
})
