import { ForbiddenException } from '@nestjs/common'

import { EmployeeController } from '@interfaces/rest/controllers'

describe('EmployeeController (additional branches)', () => {
  const mockSuccess = {
    execute: jest.fn().mockResolvedValue({ isSuccess: true, isFailure: false } as any),
  }
  const mockFailure = {
    execute: jest
      .fn()
      .mockResolvedValue({ isSuccess: false, isFailure: true, error: new Error('fail') } as any),
  }

  const presenter: any = { toResponse: jest.fn().mockImplementation((v: any) => v) }

  it('activateEmployee: succeeds (no throw) when use-case returns Success', async () => {
    const ctrl = new EmployeeController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockSuccess as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      presenter as any,
    )

    await expect(ctrl.activateEmployee('emp-1')).resolves.toBeUndefined()
    expect(mockSuccess.execute).toHaveBeenCalledWith('emp-1')
  })

  it('activateEmployee: throws when use-case returns Failure', async () => {
    const ctrl = new EmployeeController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockFailure as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      presenter as any,
    )

    await expect(ctrl.activateEmployee('emp-1')).rejects.toThrow('fail')
  })

  it('updateEmployee: throws ForbiddenException when non-admin updates other profile', async () => {
    const mockUpdate: any = { execute: jest.fn() }
    const ctrl = new EmployeeController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockUpdate as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      presenter as any,
    )

    ;(mockUpdate as any).execute.mockResolvedValue({
      isSuccess: false,
      isFailure: true,
      error: new ForbiddenException(),
    })

    await expect(ctrl.updateEmployee('emp-1', {} as any)).rejects.toBeInstanceOf(ForbiddenException)
  })
})
