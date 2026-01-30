import { EmployeeMapper } from '@application/employees/mappers'
import { UpdateEmployeeUseCase } from '@application/employees/use-cases'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { EmployeeUpdateValidator } from '@domain/employees/validators'

describe('UpdateEmployeeUseCase', () => {
  let mockRepo: any
  let mockUserContext: any
  let useCase: UpdateEmployeeUseCase

  const existingEmployee: any = { id: 'e-1', email: 'a@b.com', name: 'A', role: 'EMPLOYEE' }

  beforeEach(() => {
    jest.restoreAllMocks()
    mockRepo = { findById: jest.fn(), update: jest.fn() }
    mockUserContext = {
      getUserId: jest.fn().mockReturnValue('u-1'),
      getUserRole: jest.fn().mockReturnValue('ADMIN'),
      getEmployeeId: jest.fn().mockReturnValue('e-1'),
    }

    jest
      .spyOn(EmployeeMapper, 'fromUpdateDto')
      .mockImplementation((dto: any, e: any) => Object.assign(e, dto))
    jest
      .spyOn(EmployeeMapper, 'toResponseDto')
      .mockImplementation((e: any) => ({ id: e.id, email: e.email }) as any)

    useCase = new UpdateEmployeeUseCase(mockRepo as any, mockUserContext as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('returns Failure when unauthorized (not admin and not same employee)', async () => {
    mockUserContext.getUserRole.mockReturnValue('CLIENT')
    mockUserContext.getEmployeeId.mockReturnValue('other-id')

    const result = await useCase.execute('e-1', { name: 'New', role: 'TECH' } as any)
    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Failure when employee not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing', { name: 'X', role: 'EMPLOYEE' } as any)

    expect((result as any).isFailure).toBeTruthy()
    if ((result as any).isFailure)
      expect((result as any).error).toBeInstanceOf(EmployeeNotFoundException)
  })

  it('returns Failure when validator throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingEmployee })
    jest.spyOn(EmployeeUpdateValidator, 'validateEmployeeUpdate').mockImplementation(() => {
      throw new Error('invalid')
    })

    const result = await useCase.execute('e-1', { name: 'John', role: 'EMPLOYEE' } as any)

    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Failure when repo update throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingEmployee })
    mockRepo.update.mockRejectedValue(new Error('db'))

    const result = await useCase.execute('e-1', { name: 'X', role: 'EMPLOYEE' } as any)

    expect((result as any).isFailure).toBeTruthy()
  })

  it('returns Success when update succeeds', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingEmployee })
    mockRepo.update.mockResolvedValue({ ...existingEmployee, name: 'X' })

    // ensure validator doesn't throw in success path
    jest
      .spyOn(EmployeeUpdateValidator, 'validateEmployeeUpdate')
      .mockImplementation(() => undefined)

    const result = await useCase.execute('e-1', { name: 'John', role: 'EMPLOYEE' } as any)

    expect((result as any).isSuccess).toBeTruthy()
    if ((result as any).isSuccess) expect((result as any).value.email).toBe('a@b.com')
  })
})
