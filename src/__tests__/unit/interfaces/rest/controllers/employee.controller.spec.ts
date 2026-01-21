import { ForbiddenException } from '@nestjs/common'

import { UpdateEmployeeDto } from '@application/employees/dto'
import type { CreateEmployeeUseCase, UpdateEmployeeUseCase } from '@application/employees/use-cases'
import { EmployeeController } from '@interfaces/rest/controllers'
import { Success } from '@shared/types'

describe('EmployeeController (unit)', () => {
  let controller: EmployeeController
  let createEmployeeUseCase: jest.Mocked<CreateEmployeeUseCase>
  let updateEmployeeUseCase: jest.Mocked<UpdateEmployeeUseCase>

  const mockUpdateDto: UpdateEmployeeDto = { name: 'New Name' } as any
  const mockUpdated = { id: 'emp-1', name: 'New Name' } as any

  beforeEach(() => {
    const mockCreate = { execute: jest.fn() }
    const mockUpdate = { execute: jest.fn() }
    const mockOther = { execute: jest.fn() }
    const mockPresenter = { present: jest.fn() }

    controller = new EmployeeController(
      mockCreate as any, // CreateEmployeeUseCase
      mockOther as any, // GetEmployeeByIdUseCase
      mockOther as any, // GetAllEmployeesUseCase
      mockOther as any, // GetActiveEmployeesUseCase
      mockOther as any, // GetInactiveEmployeesUseCase
      mockUpdate as any, // UpdateEmployeeUseCase
      mockOther as any, // ActivateEmployeeUseCase
      mockOther as any, // DeactivateEmployeeUseCase
      mockOther as any, // DeleteEmployeeUseCase
      mockOther as any, // SearchEmployeesByNameUseCase
      mockOther as any, // SearchEmployeesByRoleUseCase
      mockOther as any, // GetEmployeeByEmailUseCase
      mockOther as any, // CheckEmailAvailabilityUseCase
      mockPresenter as any, // EmployeePresenter
    )

    createEmployeeUseCase = mockCreate as any
    updateEmployeeUseCase = mockUpdate as any

    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.clearAllMocks())

  it('propagates error when createEmployeeUseCase rejects', async () => {
    const err = new Error('create fail')
    createEmployeeUseCase.execute.mockRejectedValue(err)

    await expect(controller.createEmployee({} as any)).rejects.toThrow(err)
  })

  it('throws when getAllEmployeesUseCase rejects', async () => {
    ;(controller as any).getAllEmployeesUseCase.execute.mockRejectedValue(new Error('db'))

    await expect(controller.getAllEmployees()).rejects.toThrow('db')
    expect((controller as any).getAllEmployeesUseCase.execute).toHaveBeenCalled()
  })

  describe('updateEmployee', () => {
    it('throws ForbiddenException when non-admin updates other employee', async () => {
      // controller delegates authorization to the use-case; simulate a Failure with ForbiddenException
      ;(updateEmployeeUseCase as any).execute.mockResolvedValue({
        isSuccess: false,
        isFailure: true,
        error: new ForbiddenException(),
      })

      await expect(controller.updateEmployee('emp-1', mockUpdateDto)).rejects.toBeInstanceOf(
        ForbiddenException,
      )
    })

    it('returns updated employee when admin updates', async () => {
      updateEmployeeUseCase.execute.mockResolvedValue(new Success(mockUpdated) as any)

      const result = await controller.updateEmployee('emp-1', mockUpdateDto)

      expect(updateEmployeeUseCase.execute).toHaveBeenCalledWith('emp-1', mockUpdateDto)
      expect(result).toEqual(mockUpdated)
    })
  })

  it('createEmployee returns created employee on success', async () => {
    const created = { id: 'emp-new', name: 'Created' } as any

    createEmployeeUseCase.execute.mockResolvedValue(new Success(created) as any)

    const out = await controller.createEmployee({} as any)

    expect(createEmployeeUseCase.execute).toHaveBeenCalled()
    expect(out).toEqual(created)
  })

  it('getAllEmployees returns paginated result on success', async () => {
    const paginated = { items: [], total: 0 } as any

    ;(controller as any).getAllEmployeesUseCase.execute.mockResolvedValue(
      new Success(paginated) as any,
    )

    const out = await controller.getAllEmployees()

    expect(out).toEqual(paginated)
  })

  it('getActiveEmployees returns paginated result on success', async () => {
    const paginated = { items: [{ id: 'a1' }], total: 1 } as any

    ;(controller as any).getActiveEmployeesUseCase.execute.mockResolvedValue(
      new Success(paginated) as any,
    )

    const out = await controller.getActiveEmployees()

    expect(out).toEqual(paginated)
  })

  it('getInactiveEmployees returns paginated result on success', async () => {
    const paginated = { items: [{ id: 'i1' }], total: 1 } as any

    ;(controller as any).getInactiveEmployeesUseCase.execute.mockResolvedValue(
      new Success(paginated) as any,
    )

    const out = await controller.getInactiveEmployees()

    expect(out).toEqual(paginated)
  })

  it('searchEmployeesByName returns paginated result on success', async () => {
    const paginated = { items: [{ id: 's1' }], total: 1 } as any

    ;(controller as any).searchEmployeesByNameUseCase.execute.mockResolvedValue(
      new Success(paginated) as any,
    )

    const out = await controller.searchEmployeesByName('john')

    expect(out).toEqual(paginated)
  })

  it('searchEmployeesByRole returns paginated result on success', async () => {
    const paginated = { items: [{ id: 'r1' }], total: 1 } as any

    ;(controller as any).searchEmployeesByRoleUseCase.execute.mockResolvedValue(
      new Success(paginated) as any,
    )

    const out = await controller.searchEmployeesByRole('EMPLOYEE' as any)

    expect(out).toEqual(paginated)
  })

  it('getEmployeeByEmail throws when use-case returns Failure', async () => {
    ;(controller as any).getEmployeeByEmailUseCase.execute.mockResolvedValue({
      isSuccess: false,
      isFailure: true,
      error: new Error('not found'),
    } as any)

    await expect(controller.getEmployeeByEmail('x@x.com')).rejects.toThrow('not found')
  })

  it('getEmployeeByEmail returns employee on success', async () => {
    const e = { id: 'byEmail', name: 'E' } as any

    ;(controller as any).getEmployeeByEmailUseCase.execute.mockResolvedValue(new Success(e) as any)

    const out = await controller.getEmployeeByEmail('x@x.com')

    expect(out).toEqual(e)
  })

  it('checkEmailAvailability returns availability on success', async () => {
    ;(controller as any).checkEmailAvailabilityUseCase.execute.mockResolvedValue(
      new Success({
        available: true,
      }) as any,
    )

    const out = await controller.checkEmailAvailability('x@x.com')

    expect(out).toEqual({ available: true })
  })

  it('checkEmailAvailability throws when use-case returns Failure', async () => {
    ;(controller as any).checkEmailAvailabilityUseCase.execute.mockResolvedValue({
      isSuccess: false,
      isFailure: true,
      error: new Error('fail'),
    } as any)

    await expect(controller.checkEmailAvailability('x@x.com')).rejects.toThrow('fail')
  })

  it('getEmployeeById throws when not found', async () => {
    ;(controller as any).getEmployeeByIdUseCase.execute.mockResolvedValue({
      isSuccess: false,
      isFailure: true,
      error: new Error('missing'),
    } as any)

    await expect(controller.getEmployeeById('emp-xxx')).rejects.toThrow('missing')
  })

  it('deactivateEmployee and deleteEmployee succeed without throwing when use-cases return Success', async () => {
    ;(controller as any).deactivateEmployeeUseCase.execute.mockResolvedValue({
      isSuccess: true,
      isFailure: false,
    } as any)
    ;(controller as any).deleteEmployeeUseCase.execute.mockResolvedValue({
      isSuccess: true,
      isFailure: false,
    } as any)

    await expect(controller.deactivateEmployee('emp-1')).resolves.toBeUndefined()
    await expect(controller.deleteEmployee('emp-1')).resolves.toBeUndefined()
  })
})
