import { EmployeeMapper } from '@application/employees/mappers'
/* eslint-disable import/no-internal-modules */
import { GetEmployeeByEmailUseCase } from '@application/employees/use-cases/get-employee-by-email.use-case'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { Success, Failure } from '@shared/types'

describe('GetEmployeeByEmailUseCase', () => {
  const mockRepo: any = { findByEmail: jest.fn() }
  const mockUserContext: any = { getUserId: jest.fn().mockReturnValue('u1') }

  const sut = new GetEmployeeByEmailUseCase(mockRepo, mockUserContext)

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when employee not found', async () => {
    mockRepo.findByEmail.mockResolvedValue(null)

    const result = await sut.execute('noone@example.com')

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(EmployeeNotFoundException)
  })

  it('returns Success when employee exists', async () => {
    const emp: any = { id: 'e2', email: 'e2@example.com' }
    mockRepo.findByEmail.mockResolvedValue(emp)
    jest
      .spyOn(EmployeeMapper, 'toResponseDto')
      .mockReturnValue({ id: 'e2', email: 'e2@example.com' } as any)

    const result = await sut.execute('e2@example.com')

    expect(result).toBeInstanceOf(Success)
    expect((result as any).value.email).toBe('e2@example.com')
    expect(mockRepo.findByEmail).toHaveBeenCalledWith('e2@example.com')
  })
})
