import { EmployeeMapper } from '@application/employees/mappers'
import {
  ActivateEmployeeUseCase,
  DeactivateEmployeeUseCase,
} from '@application/employees/use-cases'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'

describe('ActivateEmployeeUseCase / DeactivateEmployeeUseCase', () => {
  const mockRepo: any = {
    findById: jest.fn(),
    update: jest.fn(),
  }

  const mockUserContext: any = {
    getUserId: jest.fn().mockReturnValue('user-actor'),
  }

  const makeEmployee = () => ({
    id: 'emp-1',
    email: 'jane.doe@example.com',
    active: false,
    activate() {
      this.active = true
    },
    deactivate() {
      this.active = false
    },
  })

  beforeEach(() => {
    jest
      .spyOn(EmployeeMapper, 'toResponseDto')
      .mockImplementation((e: any) => ({ id: e.id, email: e.email }) as any)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('ActivateEmployeeUseCase', () => {
    it('returns Success when employee exists and is activated', async () => {
      const employee = makeEmployee()
      mockRepo.findById.mockResolvedValue(employee)
      mockRepo.update.mockResolvedValue({ ...employee, active: true })

      const useCase = new ActivateEmployeeUseCase(mockRepo, mockUserContext)
      const result = await useCase.execute(employee.id)

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) expect(result.value).toEqual({ id: employee.id, email: employee.email })
      expect(mockRepo.findById).toHaveBeenCalledWith(employee.id)
      expect(mockRepo.update).toHaveBeenCalled()
    })

    it('returns Failure EmployeeNotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const useCase = new ActivateEmployeeUseCase(mockRepo, mockUserContext)
      const result = await useCase.execute('missing-id')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) expect(result.error).toBeInstanceOf(EmployeeNotFoundException)
      expect(mockRepo.update).not.toHaveBeenCalled()
    })

    it('returns Failure when repository update throws', async () => {
      const employee = makeEmployee()
      mockRepo.findById.mockResolvedValue(employee)
      mockRepo.update.mockRejectedValue(new Error('db failure'))

      const useCase = new ActivateEmployeeUseCase(mockRepo, mockUserContext)
      const result = await useCase.execute(employee.id)

      expect(result.isFailure).toBe(true)
      if (result.isFailure) expect(result.error).toBeInstanceOf(Error)
    })
  })

  describe('DeactivateEmployeeUseCase', () => {
    it('returns Success when employee exists and is deactivated', async () => {
      const employee = makeEmployee()
      employee.active = true
      mockRepo.findById.mockResolvedValue(employee)
      mockRepo.update.mockResolvedValue({ ...employee, active: false })

      const useCase = new DeactivateEmployeeUseCase(mockRepo, mockUserContext)
      const result = await useCase.execute(employee.id)

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) expect(result.value).toEqual({ id: employee.id, email: employee.email })
      expect(mockRepo.findById).toHaveBeenCalledWith(employee.id)
      expect(mockRepo.update).toHaveBeenCalled()
    })

    it('returns Failure EmployeeNotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const useCase = new DeactivateEmployeeUseCase(mockRepo, mockUserContext)
      const result = await useCase.execute('missing-id')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) expect(result.error).toBeInstanceOf(EmployeeNotFoundException)
      expect(mockRepo.update).not.toHaveBeenCalled()
    })

    it('returns Failure when repository update throws', async () => {
      const employee = makeEmployee()
      mockRepo.findById.mockResolvedValue(employee)
      mockRepo.update.mockRejectedValue(new Error('db failure'))

      const useCase = new DeactivateEmployeeUseCase(mockRepo, mockUserContext)
      const result = await useCase.execute(employee.id)

      expect(result.isFailure).toBe(true)
      if (result.isFailure) expect(result.error).toBeInstanceOf(Error)
    })
  })
})
