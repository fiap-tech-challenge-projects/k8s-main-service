import { EmployeeUpdateValidator } from '@domain/employees/validators'

describe('EmployeeUpdateValidator', () => {
  it('validates name, role and password rules', () => {
    // valid inputs shouldn't throw
    expect(() =>
      EmployeeUpdateValidator.validateEmployeeUpdate('John Doe', 'ADMIN', 'Abcdef1!'),
    ).not.toThrow()
  })

  it('throws for invalid name', () => {
    expect(() => EmployeeUpdateValidator.validateEmployeeUpdate('', undefined)).toThrow()
    expect(() => EmployeeUpdateValidator.validateEmployeeUpdate('A', undefined)).toThrow()
  })

  it('throws for invalid role', () => {
    expect(() => EmployeeUpdateValidator.validateEmployeeUpdate(undefined, 'INVALID')).toThrow()
  })

  it('throws for weak password', () => {
    expect(() =>
      EmployeeUpdateValidator.validateEmployeeUpdate(undefined, undefined, 'short'),
    ).toThrow()
  })
})
describe('EmployeeUpdateValidator - consolidated tests', () => {
  it('validates when no fields provided (no throw)', () => {
    expect(() => EmployeeUpdateValidator.validateEmployeeUpdate()).not.toThrow()
  })

  it('throws on empty name', () => {
    expect(() => EmployeeUpdateValidator.validateEmployeeUpdate('', undefined, undefined)).toThrow(
      'Employee name cannot be empty',
    )
  })

  it('throws on invalid role', () => {
    expect(() =>
      EmployeeUpdateValidator.validateEmployeeUpdate(undefined, 'INVALID', undefined),
    ).toThrow('Invalid employee role')
  })

  it('throws on weak password', () => {
    expect(() =>
      EmployeeUpdateValidator.validateEmployeeUpdate(undefined, undefined, 'short'),
    ).toThrow('Employee password must be at least 8 characters long')
  })
})
