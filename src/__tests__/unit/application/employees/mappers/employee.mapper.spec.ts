import { EmployeeFactory, EmployeeDtoFactory } from '@/__tests__/factories'
import { UpdateEmployeeDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'

describe('EmployeeMapper', () => {
  describe('toResponseDto', () => {
    it('should map an employee entity to response DTO correctly', () => {
      const employee = EmployeeFactory.create({
        id: 'employee-123',
        name: 'João Silva',
        email: 'joao.silva@workshop.com',
        role: 'Mechanic',
        phone: '11999999999',
        specialty: 'Engine Repair',
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })

      const result = EmployeeMapper.toResponseDto(employee)

      expect(result).toEqual({
        id: 'employee-123',
        name: 'João Silva',
        email: 'joao.silva@workshop.com',
        role: 'Mechanic',
        phone: '+55 11 99999 9999',
        specialty: 'Engine Repair',
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })
    })

    it('should map a minimal employee entity to response DTO correctly', () => {
      const employee = EmployeeFactory.createMinimal({
        id: 'employee-456',
        name: 'Maria Santos',
        email: 'maria.santos@workshop.com',
        role: 'Supervisor',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })

      const result = EmployeeMapper.toResponseDto(employee)

      expect(result).toEqual({
        id: 'employee-456',
        name: 'Maria Santos',
        email: 'maria.santos@workshop.com',
        role: 'Supervisor',
        phone: undefined,
        specialty: null,
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })
    })

    it('should use normalized email from entity', () => {
      const employee = EmployeeFactory.create({
        email: 'TEST@WORKSHOP.COM',
      })

      const result = EmployeeMapper.toResponseDto(employee)

      expect(result.email).toBe('test@workshop.com')
    })

    it('should handle null phone and specialty values', () => {
      const employee = EmployeeFactory.create({
        phone: null as any,
        specialty: null as any,
      })

      const result = EmployeeMapper.toResponseDto(employee)

      expect(result.phone).toBeUndefined()
      expect(result.specialty).toBeNull()
    })

    it('should handle undefined phone and specialty values', () => {
      const employee = EmployeeFactory.create({
        phone: undefined,
        specialty: undefined,
      })

      const result = EmployeeMapper.toResponseDto(employee)

      expect(result.phone).toBeUndefined()
      expect(result.specialty).toBeNull()
    })

    it('should handle inactive employee', () => {
      const employee = EmployeeFactory.createInactive({
        id: 'employee-789',
        name: 'Inactive Employee',
      })

      const result = EmployeeMapper.toResponseDto(employee)

      expect(result.isActive).toBe(false)
    })
  })

  describe('toResponseDtoArray', () => {
    it('should map an array of employee entities to response DTOs correctly', () => {
      const employees = [
        EmployeeFactory.create({ id: 'employee-1', name: 'Employee 1' }),
        EmployeeFactory.create({ id: 'employee-2', name: 'Employee 2' }),
        EmployeeFactory.create({ id: 'employee-3', name: 'Employee 3' }),
      ]

      const result = EmployeeMapper.toResponseDtoArray(employees)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('id', 'employee-1')
      expect(result[0]).toHaveProperty('name', 'Employee 1')
      expect(result[1]).toHaveProperty('id', 'employee-2')
      expect(result[1]).toHaveProperty('name', 'Employee 2')
      expect(result[2]).toHaveProperty('id', 'employee-3')
      expect(result[2]).toHaveProperty('name', 'Employee 3')
    })

    it('should return empty array when input is empty', () => {
      const result = EmployeeMapper.toResponseDtoArray([])

      expect(result).toHaveLength(0)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle mixed employee types', () => {
      const employees = [
        EmployeeFactory.create({ id: 'employee-1', name: 'Full Employee' }),
        EmployeeFactory.createMinimal({ id: 'employee-2', name: 'Minimal Employee' }),
        EmployeeFactory.createInactive({ id: 'employee-3', name: 'Inactive Employee' }),
      ]

      const result = EmployeeMapper.toResponseDtoArray(employees)

      expect(result).toHaveLength(3)
      expect(result[0].phone).not.toBeNull()
      expect(result[1].phone).toBeUndefined()
      expect(result[2].isActive).toBe(false)
    })
  })

  describe('fromCreateDto', () => {
    it('should map create DTO to employee entity correctly', () => {
      const createDto = EmployeeDtoFactory.createCreateEmployeeDto({
        name: 'New Employee',
        email: 'new.employee@workshop.com',
        role: 'Electrician',
        phone: '(11) 88888-7777',
        specialty: 'Auto Electrical',
        isActive: true,
      })

      const result = EmployeeMapper.fromCreateDto(createDto)

      expect(result).toBeInstanceOf(Object)
      expect(result.name).toBe('New Employee')
      expect(result.email.value).toBe('new.employee@workshop.com')
      expect(result.role).toBe('Electrician')
      expect(result.phone).toBe('(11) 88888-7777')
      expect(result.specialty).toBe('Auto Electrical')
      expect(result.isActive).toBe(true)
    })

    it('should map minimal create DTO to employee entity correctly', () => {
      const createDto = EmployeeDtoFactory.createMinimalCreateEmployeeDto({
        name: 'Minimal Employee',
        email: 'minimal.employee@workshop.com',
        role: 'Supervisor',
      })

      const result = EmployeeMapper.fromCreateDto(createDto)

      expect(result).toBeInstanceOf(Object)
      expect(result.name).toBe('Minimal Employee')
      expect(result.email.value).toBe('minimal.employee@workshop.com')
      expect(result.role).toBe('Supervisor')
      expect(result.phone).toBeUndefined()
      expect(result.specialty).toBeUndefined()
      expect(result.isActive).toBe(true)
    })

    it('should handle undefined optional fields', () => {
      const createDto = EmployeeDtoFactory.createCreateEmployeeDto()
      delete createDto.phone
      delete createDto.specialty
      delete createDto.isActive

      const result = EmployeeMapper.fromCreateDto(createDto)

      expect(result.phone).toBeUndefined()
      expect(result.specialty).toBeUndefined()
      expect(result.isActive).toBe(true)
    })

    it('should handle inactive employee creation', () => {
      const createDto = EmployeeDtoFactory.createCreateEmployeeDto({
        isActive: false,
      })

      const result = EmployeeMapper.fromCreateDto(createDto)

      expect(result.isActive).toBe(false)
    })
  })

  describe('fromUpdateDto', () => {
    it('should map update DTO to updated employee entity correctly', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-123',
        name: 'Original Name',
        email: 'original@workshop.com',
        role: 'Mechanic',
        phone: '(11) 99999-9999',
        specialty: 'General Repair',
        isActive: true,
      })

      const updateDto = EmployeeDtoFactory.createUpdateEmployeeDto({
        name: 'Updated Name',
        email: 'updated@workshop.com',
        role: 'Senior Mechanic',
        phone: '(11) 77777-8888',
        specialty: 'Advanced Repair',
        isActive: false,
      })

      const result = EmployeeMapper.fromUpdateDto(updateDto, existingEmployee)

      expect(result).toBeInstanceOf(Object)
      expect(result.id).toBe('employee-123')
      expect(result.name).toBe('Updated Name')
      expect(result.email.value).toBe('updated@workshop.com')
      expect(result.role).toBe('Senior Mechanic')
      expect(result.phone).toBe('(11) 77777-8888')
      expect(result.specialty).toBe('Advanced Repair')
      expect(result.isActive).toBe(false)
    })

    it('should handle partial update DTO', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-123',
        name: 'Original Name',
        email: 'original@workshop.com',
        role: 'Mechanic',
        phone: '(11) 99999-9999',
        specialty: 'General Repair',
        isActive: true,
      })

      const updateDto = EmployeeDtoFactory.createPartialUpdateEmployeeDto({
        name: 'Updated Name',
        specialty: 'Updated Specialty',
      })

      const result = EmployeeMapper.fromUpdateDto(updateDto, existingEmployee)

      expect(result).toBeInstanceOf(Object)
      expect(result.id).toBe('employee-123')
      expect(result.name).toBe('Updated Name')
      expect(result.email.value).toBe('original@workshop.com')
      expect(result.role).toBe('Mechanic')
      expect(result.phone).toBe('(11) 99999-9999')
      expect(result.specialty).toBe('Updated Specialty')
      expect(result.isActive).toBe(true)
    })

    it('should handle update with undefined fields', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-123',
        name: 'Original Name',
        email: 'original@workshop.com',
        role: 'Mechanic',
        phone: '(11) 99999-9999',
        specialty: 'General Repair',
        isActive: true,
      })

      const updateDto = EmployeeDtoFactory.createUpdateEmployeeDto()
      delete updateDto.name
      delete updateDto.email
      delete updateDto.role
      delete updateDto.phone
      delete updateDto.specialty
      delete updateDto.isActive

      const result = EmployeeMapper.fromUpdateDto(updateDto, existingEmployee)

      expect(result).toBeInstanceOf(Object)
      expect(result.id).toBe('employee-123')
      expect(result.name).toBe('Original Name')
      expect(result.email.value).toBe('original@workshop.com')
      expect(result.role).toBe('Mechanic')
      expect(result.phone).toBe('(11) 99999-9999')
      expect(result.specialty).toBe('General Repair')
      expect(result.isActive).toBe(true)
    })

    it('should handle update with null fields', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-123',
        name: 'Original Name',
        email: 'original@workshop.com',
        role: 'Mechanic',
        phone: '(11) 99999-9999',
        specialty: 'General Repair',
        isActive: true,
      })

      const updateDto = EmployeeDtoFactory.createUpdateEmployeeDto({
        phone: null as any,
        specialty: null as any,
      })

      const result = EmployeeMapper.fromUpdateDto(updateDto, existingEmployee)

      expect(result).toBeInstanceOf(Object)
      expect(result.phone).toBeNull()
      expect(result.specialty).toBeNull()
    })

    it('should preserve existing values when fields are not provided', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-123',
        name: 'Original Name',
        email: 'original@workshop.com',
        role: 'Mechanic',
        phone: '(11) 99999-9999',
        specialty: 'General Repair',
        isActive: true,
      })

      const updateDto = new UpdateEmployeeDto()
      updateDto.name = 'Updated Name'

      const result = EmployeeMapper.fromUpdateDto(updateDto, existingEmployee)

      expect(result).toBeInstanceOf(Object)
      expect(result.name).toBe('Updated Name')
      expect(result.email.normalized).toBe('original@workshop.com')
      expect(result.role).toBe('Mechanic')
      expect(result.phone).toBe('(11) 99999-9999')
      expect(result.specialty).toBe('General Repair')
      expect(result.isActive).toBe(true)
    })

    it('should not call updateEmail/updatePhone when values are identical', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-456',
        name: 'Same Name',
        email: 'same@workshop.com',
        phone: '(11) 12345-6789',
      })

      existingEmployee.updateEmail = jest.fn()
      existingEmployee.updatePhone = jest.fn()

      const updateDto: UpdateEmployeeDto = {
        email: 'same@workshop.com',
        phone: '(11) 12345-6789',
      } as any

      const result = EmployeeMapper.fromUpdateDto(updateDto, existingEmployee as any)

      expect(existingEmployee.updateEmail).not.toHaveBeenCalled()
      expect(existingEmployee.updatePhone).not.toHaveBeenCalled()
      expect(result.email.normalized).toBe('same@workshop.com')
    })

    it('should allow setting phone to null via updateDto', () => {
      const existingEmployee = EmployeeFactory.create({
        id: 'employee-789',
        phone: '(11) 22222-3333',
      })

      const updateDto: UpdateEmployeeDto = {
        phone: null as any,
      }

      const result = EmployeeMapper.fromUpdateDto(updateDto as any, existingEmployee as any)

      expect(result.phone).toBeNull()
    })
  })
})
