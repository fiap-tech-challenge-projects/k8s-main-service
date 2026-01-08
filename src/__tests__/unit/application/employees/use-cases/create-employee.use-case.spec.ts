import { EmployeeMapper } from '@application/employees/mappers'
import { CreateEmployeeUseCase } from '@application/employees/use-cases'
import { EmployeeCreationValidator } from '@domain/employees/validators'

describe('CreateEmployeeUseCase', () => {
  it('returns Success when employee is created', async () => {
    const createDto = { email: 'a@b.com', name: 'A', role: 'admin' }
    const repo = {
      emailExists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue({ id: 'e-1' }),
    }
    const userContextService = {
      getUserId: jest.fn().mockReturnValue('u-1'),
    }

    // validator/mappers
    jest
      .spyOn(EmployeeCreationValidator, 'validateEmployeeCreationWithoutPassword')
      .mockResolvedValue()
    jest.spyOn(EmployeeMapper, 'fromCreateDto').mockReturnValue({} as any)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ id: 'e-1' } as any)

    const useCase = new CreateEmployeeUseCase(repo as any, userContextService as any)
    const res = await useCase.execute(createDto as any)
    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('e-1')
  })

  it('returns Failure when email already exists', async () => {
    const createDto = { email: 'a@b.com', name: 'A', role: 'admin' }
    const repo = {
      emailExists: jest.fn().mockResolvedValue(true),
    }
    const userContextService = {
      getUserId: jest.fn().mockReturnValue('u-1'),
    }
    const useCase = new CreateEmployeeUseCase(repo as any, userContextService as any)

    const res = await useCase.execute(createDto as any)
    expect(res.isFailure).toBe(true)
  })
})
