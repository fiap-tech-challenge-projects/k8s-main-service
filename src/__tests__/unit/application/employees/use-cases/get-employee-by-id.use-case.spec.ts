/* eslint-disable import/no-internal-modules */
import { EmployeeMapper } from '@application/employees/mappers'
import { GetEmployeeByIdUseCase } from '@application/employees/use-cases/get-employee-by-id.use-case'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { Success, Failure } from '@shared/types'

describe('GetEmployeeByIdUseCase', () => {
  const mockRepo: any = { findById: jest.fn() }
  const mockUserContext: any = { getUserId: jest.fn().mockReturnValue('u1') }

  const sut = new GetEmployeeByIdUseCase(mockRepo, mockUserContext)

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when employee not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await sut.execute('e1')

    expect(result).toBeInstanceOf(Failure)
    expect((result as any).error).toBeInstanceOf(EmployeeNotFoundException)
  })

  it('returns Success when employee exists', async () => {
    const emp: any = { id: 'e1', name: 'Emp' }
    mockRepo.findById.mockResolvedValue(emp)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e1' } as any)

    const result = await sut.execute('e1')

    expect(result).toBeInstanceOf(Success)
    expect((result as any).value.id).toBe('e1')
  })
})
