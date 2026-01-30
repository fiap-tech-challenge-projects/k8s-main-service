import { EmployeeAlreadyExistsException } from '@domain/employees/exceptions'
import { EmployeeCreationValidator } from '@domain/employees/validators'

describe('EmployeeCreationValidator', () => {
  const okEmail = 'a@b.com'
  const okName = 'Bruna'
  const okRole = 'EMPLOYEE'
  const okPassword = 'Aa1!abcd'
  // reuse a single mock for existence checks to reduce allocation and async overhead
  let existsMock: jest.Mock<Promise<boolean>, [string]>

  beforeEach(() => {
    // ensure the mock signature matches (accepts an email string)
    existsMock = jest.fn(async (_email: string) => {
      void _email
      return false
    }) as jest.Mock<Promise<boolean>, [string]>
  })

  afterEach(() => jest.restoreAllMocks())

  it('throws when required fields missing (multiple cases combined)', async () => {
    // combine multiple missing-field checks into one test to reduce Jest overhead
    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        '',
        okName,
        okRole,
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow('Employee email is required')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        '',
        okRole,
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow('Employee name is required')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        okName,
        '',
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow('Employee role is required')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(okEmail, okName, okRole, '', existsMock),
    ).rejects.toThrow('Employee password is required')
  })

  it('throws on invalid email, name length, role and password rules (combined)', async () => {
    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        'badmail',
        okName,
        okRole,
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow('Invalid email format')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        'A',
        okRole,
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow('Employee name must be at least 2 characters long')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        'A'.repeat(101),
        okRole,
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow('Employee name must be less than 100 characters long')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        okName,
        'BADROLE',
        okPassword,
        existsMock,
      ),
    ).rejects.toThrow(/Invalid employee role/)

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        okName,
        okRole,
        'short',
        existsMock,
      ),
    ).rejects.toThrow('Employee password must be at least 8 characters long')

    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        okName,
        okRole,
        'aaaaaaaa',
        existsMock,
      ),
    ).rejects.toThrow(/must contain at least one uppercase letter/)
  })

  it('throws EmployeeAlreadyExistsException when employeeExists returns true', async () => {
    existsMock.mockResolvedValueOnce(true)
    await expect(
      EmployeeCreationValidator.validateEmployeeCreation(
        okEmail,
        okName,
        okRole,
        okPassword,
        existsMock,
      ),
    ).rejects.toBeInstanceOf(EmployeeAlreadyExistsException)
  })

  it('validateEmployeeCreationWithoutPassword works and checks exists (both outcomes)', async () => {
    // first simulate exists -> throws
    existsMock.mockResolvedValueOnce(true)
    await expect(
      EmployeeCreationValidator.validateEmployeeCreationWithoutPassword(
        okEmail,
        okName,
        okRole,
        existsMock,
      ),
    ).rejects.toBeInstanceOf(EmployeeAlreadyExistsException)

    // then simulate not exists -> resolves
    existsMock.mockResolvedValueOnce(false)
    await expect(
      EmployeeCreationValidator.validateEmployeeCreationWithoutPassword(
        okEmail,
        okName,
        okRole,
        existsMock,
      ),
    ).resolves.toBeUndefined()
  })
})
