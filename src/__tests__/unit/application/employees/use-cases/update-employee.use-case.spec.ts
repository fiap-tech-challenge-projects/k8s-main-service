import { EmployeeMapper } from '@application/employees/mappers'
import { UpdateEmployeeUseCase } from '@application/employees/use-cases'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { EmployeeUpdateValidator } from '@domain/employees/validators'

/* eslint-disable import/no-internal-modules */
import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'
import { silenceNestJSLogs } from '../../../test-utils/silence-logs'

describe('UpdateEmployeeUseCase', () => {
  // silence any Nest logs for this spec
  beforeAll(() => {
    silenceNestJSLogs()
    setupLoggerMock()
  })
  afterAll(() => {
    clearLoggerMocks()
  })

  const repo: any = {
    findById: jest.fn(),
    update: jest.fn(),
  }

  const userContext: any = {
    getUserId: () => 'u-1',
    getUserRole: () => 'ADMIN',
    getEmployeeId: () => 'e-1',
  }

  beforeEach(() => jest.clearAllMocks())
  afterEach(() => jest.restoreAllMocks())

  it('returns Failure when employee not found', async () => {
    repo.findById.mockResolvedValue(null)

    const useCase = new UpdateEmployeeUseCase(repo as any, userContext as any)
    const res = await useCase.execute('e-1', { name: 'Name', role: 'MECHANIC' } as any)

    expect(res.isFailure).toBe(true)
    expect((res as any).error).toBeInstanceOf(EmployeeNotFoundException)
    expect(repo.findById).toHaveBeenCalledWith('e-1')
  })

  it('updates successfully when employee exists', async () => {
    const existing = { id: 'e-1', email: 'a@b.com' }
    const saved = { id: 'e-1', email: 'a@b.com' }

    repo.findById.mockResolvedValue(existing)
    repo.update.mockResolvedValue(saved)

    jest.spyOn(EmployeeUpdateValidator, 'validateEmployeeUpdate').mockImplementation(() => {})
    jest.spyOn(EmployeeMapper, 'fromUpdateDto').mockReturnValue({} as any)
    jest.spyOn(EmployeeMapper, 'toResponseDto').mockReturnValue({ email: 'a@b.com' } as any)

    const useCase = new UpdateEmployeeUseCase(repo as any, userContext as any)
    const res = await useCase.execute('e-1', { name: 'Name', role: 'MECHANIC' } as any)

    expect(res.isSuccess).toBe(true)
    expect((res as any).value.email).toBe('a@b.com')
    expect(repo.update).toHaveBeenCalled()
  })
})
