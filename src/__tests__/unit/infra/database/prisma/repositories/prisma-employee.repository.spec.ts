import { Logger } from '@nestjs/common'
import { Employee as PrismaEmployee } from '@prisma/client'

import { EmployeeFactory } from '@/__tests__/factories'
import { Employee } from '@domain/employees/entities'
import { PrismaEmployeeRepository } from '@infra/database/prisma/repositories'
import { Email } from '@shared'

describe('PrismaEmployeeRepository', () => {
  let repository: PrismaEmployeeRepository
  let prismaService: any

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

  beforeEach(async () => {
    const mockPrismaService = {
      employee: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any

    // pure-unit: instantiate repository directly
    repository = new PrismaEmployeeRepository(mockPrismaService as any)
    prismaService = mockPrismaService

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByEmail', () => {
    it('should find employee by email successfully', async () => {
      const email = 'john.doe@example.com'
      const normalizedEmail = new Email(email).normalized

      prismaService.employee.findUnique.mockResolvedValue(mockPrismaEmployee)

      const result = await repository.findByEmail(email)

      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { email: normalizedEmail },
      })
      expect(result).toBeInstanceOf(Employee)
      expect(result?.id).toBe('employee-123')
    })

    it('should return null when employee not found', async () => {
      const email = 'john.doe@example.com'

      prismaService.employee.findUnique.mockResolvedValue(null)

      const result = await repository.findByEmail(email)

      expect(result).toBeNull()
    })

    it('should throw error when email validation fails', async () => {
      const invalidEmail = 'invalid-email'

      await expect(repository.findByEmail(invalidEmail)).rejects.toThrow()
    })
  })

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      const email = 'john.doe@example.com'
      const normalizedEmail = new Email(email).normalized

      prismaService.employee.count.mockResolvedValue(1)

      const result = await repository.emailExists(email)

      expect(prismaService.employee.count).toHaveBeenCalledWith({
        where: { email: normalizedEmail },
      })
      expect(result).toBe(true)
    })

    it('should return false when email does not exist', async () => {
      const email = 'john.doe@example.com'

      prismaService.employee.count.mockResolvedValue(0)

      const result = await repository.emailExists(email)

      expect(result).toBe(false)
    })

    it('should rethrow when uniqueFieldExists fails internally', async () => {
      const email = 'john.doe@example.com'
      const internalError = new Error('Internal failure')
      jest.spyOn(repository as any, 'uniqueFieldExists').mockRejectedValueOnce(internalError)

      await expect(repository.emailExists(email)).rejects.toThrow('Internal failure')
    })
  })

  describe('findByName', () => {
    it('should find employees by name with pagination', async () => {
      const name = 'John'
      const page = 1
      const limit = 10
      const mockEmployees = [mockPrismaEmployee]
      const totalCount = 1

      prismaService.employee.findMany.mockResolvedValue(mockEmployees)
      prismaService.employee.count.mockResolvedValue(totalCount)

      const result = await repository.findByName(name, page, limit)

      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(prismaService.employee.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const name = 'John'

      prismaService.employee.findMany.mockResolvedValue([])
      prismaService.employee.count.mockResolvedValue(0)

      await repository.findByName(name)

      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('findByRole', () => {
    it('should find employees by role with pagination', async () => {
      const role = 'MECHANIC'
      const page = 1
      const limit = 10
      const mockEmployees = [mockPrismaEmployee]
      const totalCount = 1

      prismaService.employee.findMany.mockResolvedValue(mockEmployees)
      prismaService.employee.count.mockResolvedValue(totalCount)

      const result = await repository.findByRole(role, page, limit)

      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          role: {
            contains: role,
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })
  })

  describe('findActive', () => {
    it('should find active employees with pagination', async () => {
      const page = 1
      const limit = 10
      const mockEmployees = [mockPrismaEmployee]
      const totalCount = 1

      prismaService.employee.findMany.mockResolvedValue(mockEmployees)
      prismaService.employee.count.mockResolvedValue(totalCount)

      const result = await repository.findActive(page, limit)

      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })
  })

  describe('findInactive', () => {
    it('should find inactive employees with pagination', async () => {
      const page = 1
      const limit = 10
      const mockEmployees = [mockPrismaEmployee]
      const totalCount = 1

      prismaService.employee.findMany.mockResolvedValue(mockEmployees)
      prismaService.employee.count.mockResolvedValue(totalCount)

      const result = await repository.findInactive(page, limit)

      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          isActive: false,
        },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })
  })

  describe('inherited methods', () => {
    it('should create employee successfully', async () => {
      const employee = EmployeeFactory.create()
      const createData = {
        name: employee.name,
        email: employee.email.value,
        role: employee.role,
        phone: employee.phone ?? null,
        specialty: employee.specialty ?? null,
        isActive: employee.isActive,
      }

      prismaService.employee.create.mockResolvedValue(mockPrismaEmployee)

      const result = await repository.create(employee)

      expect(prismaService.employee.create).toHaveBeenCalledWith({
        data: createData,
      })
      expect(result).toBeInstanceOf(Employee)
    })

    it('should update employee successfully', async () => {
      const employee = EmployeeFactory.create({ id: 'employee-123' })
      const updateData = {
        name: employee.name,
        email: employee.email.value,
        role: employee.role,
        phone: employee.phone ?? null,
        specialty: employee.specialty ?? null,
        isActive: employee.isActive,
        updatedAt: expect.any(Date),
      }

      prismaService.employee.update.mockResolvedValue(mockPrismaEmployee)

      const result = await repository.update(employee.id, employee)

      expect(prismaService.employee.update).toHaveBeenCalledWith({
        where: { id: employee.id },
        data: updateData,
      })
      expect(result).toBeInstanceOf(Employee)
    })

    it('should delete employee successfully', async () => {
      const employeeId = 'employee-123'

      prismaService.employee.delete.mockResolvedValue(mockPrismaEmployee)

      const result = await repository.delete(employeeId)

      expect(prismaService.employee.delete).toHaveBeenCalledWith({
        where: { id: employeeId },
      })
      expect(result).toBe(true)
    })

    it('should find employee by id successfully', async () => {
      const employeeId = 'employee-123'

      prismaService.employee.findUnique.mockResolvedValue(mockPrismaEmployee)

      const result = await repository.findById(employeeId)

      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: employeeId },
      })
      expect(result).toBeInstanceOf(Employee)
    })

    it('should find all employees with pagination', async () => {
      const mockEmployees = [mockPrismaEmployee]
      const totalCount = 1

      prismaService.employee.findMany.mockResolvedValue(mockEmployees)
      prismaService.employee.count.mockResolvedValue(totalCount)

      const result = await repository.findAll(1, 10)

      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {},
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })
  })
})
