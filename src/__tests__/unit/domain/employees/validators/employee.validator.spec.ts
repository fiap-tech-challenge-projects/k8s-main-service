/// <reference types="jest" />

import { EmployeeAlreadyExistsException } from '@domain/employees/exceptions'
import { EmployeeValidator } from '@domain/employees/validators'

describe('EmployeeValidator', () => {
  describe('validateEmployeeCreation', () => {
    it('resolves when all fields valid and not existing', async () => {
      const existsMock = jest.fn(async () => false)
      await expect(
        EmployeeValidator.validateEmployeeCreation('a@b.com', 'Alice', 'EMPLOYEE', existsMock),
      ).resolves.toBeUndefined()
      expect(existsMock).toHaveBeenCalledWith('a@b.com')
    })

    it('throws EmployeeAlreadyExistsException when employee exists', async () => {
      const existsMock = jest.fn(async () => true)
      await expect(
        EmployeeValidator.validateEmployeeCreation('a@b.com', 'Alice', 'EMPLOYEE', existsMock),
      ).rejects.toThrow(EmployeeAlreadyExistsException)
    })

    it('throws when email is missing', async () => {
      const existsMock = jest.fn(async () => false)
      await expect(
        EmployeeValidator.validateEmployeeCreation('', 'Alice', 'EMPLOYEE', existsMock),
      ).rejects.toThrow('Employee email is required')
    })

    it('throws when name is missing', async () => {
      const existsMock = jest.fn(async () => false)
      await expect(
        EmployeeValidator.validateEmployeeCreation('a@b.com', '', 'EMPLOYEE', existsMock),
      ).rejects.toThrow('Employee name is required')
    })

    it('throws when role is missing', async () => {
      const existsMock = jest.fn(async () => false)
      await expect(
        EmployeeValidator.validateEmployeeCreation('a@b.com', 'Alice', '', existsMock),
      ).rejects.toThrow('Employee role is required')
    })
  })

  describe('validateEmployeeEmail', () => {
    it('resolves when valid and not exists', async () => {
      const existsMock = jest.fn(async () => false)
      await expect(
        EmployeeValidator.validateEmployeeEmail('x@y.com', existsMock),
      ).resolves.toBeUndefined()
    })

    it('throws when email missing', async () => {
      const existsMock = jest.fn(async () => false)
      await expect(EmployeeValidator.validateEmployeeEmail('', existsMock)).rejects.toThrow(
        'Employee email is required',
      )
    })

    it('throws EmployeeAlreadyExistsException when exists', async () => {
      const existsMock = jest.fn(async () => true)
      await expect(EmployeeValidator.validateEmployeeEmail('x@y.com', existsMock)).rejects.toThrow(
        EmployeeAlreadyExistsException,
      )
    })
  })

  describe('validateEmployeeRole', () => {
    it('resolves for ADMIN and EMPLOYEE', () => {
      expect(() => EmployeeValidator.validateEmployeeRole('ADMIN')).not.toThrow()
      expect(() => EmployeeValidator.validateEmployeeRole('employee')).not.toThrow()
    })

    it('throws when missing', () => {
      expect(() => EmployeeValidator.validateEmployeeRole('')).toThrow('Employee role is required')
    })

    it('throws when invalid', () => {
      expect(() => EmployeeValidator.validateEmployeeRole('MANAGER')).toThrow(
        'Invalid employee role. Must be one of: ADMIN, EMPLOYEE',
      )
    })
  })

  describe('validateEmployeeName', () => {
    it('resolves for valid names', () => {
      expect(() => EmployeeValidator.validateEmployeeName('Al')).not.toThrow()
    })

    it('throws when missing', () => {
      expect(() => EmployeeValidator.validateEmployeeName('')).toThrow('Employee name is required')
    })

    it('throws when too short', () => {
      expect(() => EmployeeValidator.validateEmployeeName('A')).toThrow(
        'Employee name must be at least 2 characters long',
      )
    })

    it('throws when too long', () => {
      const long = 'A'.repeat(101)
      expect(() => EmployeeValidator.validateEmployeeName(long)).toThrow(
        'Employee name must be less than 100 characters long',
      )
    })
  })
})
