import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponseDto,
} from '@application/employees/dto'
import { Employee } from '@domain/employees/entities'
import { validateBaseMapper } from '@shared'
import { PhoneFormatter } from '@shared/utils'

/**
 * Mapper for converting between Employee entities and DTOs
 */
export class EmployeeMapper {
  /**
   * Convert Employee entity to response DTO
   * @param employee - Employee entity
   * @returns Employee response DTO
   */
  static toResponseDto(employee: Employee): EmployeeResponseDto {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email.normalized,
      role: employee.role,
      phone: PhoneFormatter.format(employee.phone),
      specialty: employee.specialty ?? null,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }
  }

  /**
   * Convert array of Employee entities to response DTOs
   * @param employees - Array of Employee entities
   * @returns Array of Employee response DTOs
   */
  static toResponseDtoArray(employees: Employee[]): EmployeeResponseDto[] {
    return employees.map((employee) => this.toResponseDto(employee))
  }

  /**
   * Convert create DTO to Employee entity
   * @param createEmployeeDto - Create employee DTO
   * @returns Employee entity
   */
  static fromCreateDto(createEmployeeDto: CreateEmployeeDto): Employee {
    return Employee.create(
      createEmployeeDto.name,
      createEmployeeDto.email,
      createEmployeeDto.role,
      createEmployeeDto.phone,
      createEmployeeDto.specialty,
      createEmployeeDto.isActive,
    )
  }

  /**
   * Convert update DTO to updated Employee entity
   * @param updateEmployeeDto - Update employee DTO
   * @param existingEmployee - Existing employee entity
   * @returns The same Employee entity with updated properties
   */
  static fromUpdateDto(updateEmployeeDto: UpdateEmployeeDto, existingEmployee: Employee): Employee {
    if (updateEmployeeDto.name !== undefined && updateEmployeeDto.name !== existingEmployee.name) {
      existingEmployee.updateName(updateEmployeeDto.name)
    }

    if (
      updateEmployeeDto.email !== undefined &&
      updateEmployeeDto.email !== existingEmployee.email.normalized
    ) {
      existingEmployee.updateEmail(updateEmployeeDto.email)
    }

    if (updateEmployeeDto.role !== undefined && updateEmployeeDto.role !== existingEmployee.role) {
      existingEmployee.updateRole(updateEmployeeDto.role)
    }

    if (
      updateEmployeeDto.phone !== undefined &&
      updateEmployeeDto.phone !== existingEmployee.phone
    ) {
      existingEmployee.updatePhone(updateEmployeeDto.phone)
    }

    if (
      updateEmployeeDto.specialty !== undefined &&
      updateEmployeeDto.specialty !== existingEmployee.specialty
    ) {
      existingEmployee.updateSpecialty(updateEmployeeDto.specialty)
    }

    if (
      updateEmployeeDto.isActive !== undefined &&
      updateEmployeeDto.isActive !== existingEmployee.isActive
    ) {
      existingEmployee.updateIsActive(updateEmployeeDto.isActive)
    }

    return existingEmployee
  }
}

// Validate that this mapper implements the BaseMapper contract
validateBaseMapper(EmployeeMapper, 'EmployeeMapper')
