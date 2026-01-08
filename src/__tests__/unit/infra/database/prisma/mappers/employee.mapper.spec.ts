import { Employee as PrismaEmployee } from '@prisma/client'

import { Employee } from '@domain/employees/entities'
import { EmployeeMapper } from '@infra/database/prisma/mappers'
import { Email } from '@shared'

describe('EmployeeMapper', () => {
  const mockPrismaEmployee: PrismaEmployee = {
    id: 'employee-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'MECHANIC',
    phone: '+55 11 99999-9999',
    specialty: 'ENGINE_REPAIR',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockDomainEmployee = new Employee(
    'employee-123',
    'John Doe',
    Email.create('john.doe@example.com'),
    'MECHANIC',
    '+55 11 99999-9999',
    'ENGINE_REPAIR',
    true,
    new Date('2023-01-01'),
    new Date('2023-01-02'),
  )

  describe('toDomain', () => {
    it('should convert Prisma Employee to domain entity', () => {
      const result = EmployeeMapper.toDomain(mockPrismaEmployee)

      expect(result).toBeInstanceOf(Employee)
      expect(result.id).toBe('employee-123')
      expect(result.name).toBe('John Doe')
      expect(result.email.value).toBe('john.doe@example.com')
      expect(result.role).toBe('MECHANIC')
      expect(result.phone).toBe('+55 11 99999-9999')
      expect(result.specialty).toBe('ENGINE_REPAIR')
      expect(result.isActive).toBe(true)
    })

    it('should handle null optional fields', () => {
      const prismaEmployeeWithNulls = {
        ...mockPrismaEmployee,
        phone: null,
        specialty: null,
      }

      const result = EmployeeMapper.toDomain(prismaEmployeeWithNulls)

      expect(result.phone).toBeUndefined()
      expect(result.specialty).toBeUndefined()
    })

    it('should throw error when Prisma Employee is null', () => {
      expect(() => EmployeeMapper.toDomain(null as any)).toThrow(
        'Prisma Employee model cannot be null or undefined',
      )
    })

    it('should throw error when Prisma Employee is undefined', () => {
      expect(() => EmployeeMapper.toDomain(undefined as any)).toThrow(
        'Prisma Employee model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('should convert array of Prisma Employees to domain entities', () => {
      const prismaEmployees = [mockPrismaEmployee, { ...mockPrismaEmployee, id: 'employee-456' }]

      const result = EmployeeMapper.toDomainMany(prismaEmployees)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Employee)
      expect(result[1]).toBeInstanceOf(Employee)
      expect(result[0].id).toBe('employee-123')
      expect(result[1].id).toBe('employee-456')
    })

    it('should filter out null and undefined values', () => {
      const prismaEmployees = [
        mockPrismaEmployee,
        null,
        undefined,
        { ...mockPrismaEmployee, id: 'employee-456' },
      ] as any

      const result = EmployeeMapper.toDomainMany(prismaEmployees)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('employee-123')
      expect(result[1].id).toBe('employee-456')
    })

    it('should return empty array when input is not an array', () => {
      expect(EmployeeMapper.toDomainMany(null as any)).toEqual([])
      expect(EmployeeMapper.toDomainMany(undefined as any)).toEqual([])
      expect(EmployeeMapper.toDomainMany('not-an-array' as any)).toEqual([])
    })

    it('should return empty array for empty input', () => {
      expect(EmployeeMapper.toDomainMany([])).toEqual([])
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert domain entity to Prisma create data', () => {
      const result = EmployeeMapper.toPrismaCreate(mockDomainEmployee)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'MECHANIC',
        phone: '+55 11 99999-9999',
        specialty: 'ENGINE_REPAIR',
        isActive: true,
      })
    })

    it('should handle undefined optional fields', () => {
      const employeeWithoutOptionals = new Employee(
        'employee-123',
        'John Doe',
        Email.create('john.doe@example.com'),
        'MECHANIC',
        undefined,
        undefined,
        true,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
      )

      const result = EmployeeMapper.toPrismaCreate(employeeWithoutOptionals)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'MECHANIC',
        phone: null,
        specialty: null,
        isActive: true,
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => EmployeeMapper.toPrismaCreate(null as any)).toThrow(
        'Employee domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => EmployeeMapper.toPrismaCreate(undefined as any)).toThrow(
        'Employee domain entity cannot be null or undefined',
      )
    })
  })

  describe('toPrismaUpdate', () => {
    it('should convert domain entity to Prisma update data', () => {
      const result = EmployeeMapper.toPrismaUpdate(mockDomainEmployee)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'MECHANIC',
        phone: '+55 11 99999-9999',
        specialty: 'ENGINE_REPAIR',
        isActive: true,
        updatedAt: expect.any(Date),
      })
    })

    it('should handle undefined optional fields', () => {
      const employeeWithoutOptionals = new Employee(
        'employee-123',
        'John Doe',
        Email.create('john.doe@example.com'),
        'MECHANIC',
        undefined,
        undefined,
        true,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
      )

      const result = EmployeeMapper.toPrismaUpdate(employeeWithoutOptionals)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'MECHANIC',
        phone: null,
        specialty: null,
        isActive: true,
        updatedAt: expect.any(Date),
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => EmployeeMapper.toPrismaUpdate(null as any)).toThrow(
        'Employee domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => EmployeeMapper.toPrismaUpdate(undefined as any)).toThrow(
        'Employee domain entity cannot be null or undefined',
      )
    })
  })
})
