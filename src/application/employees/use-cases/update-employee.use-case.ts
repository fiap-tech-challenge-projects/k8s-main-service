import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateEmployeeDto, EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import {
  EmployeeNotFoundException,
  EmployeeAlreadyExistsException,
} from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { EmployeeUpdateValidator } from '@domain/employees/validators'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating an employee
 * Handles the orchestration for employee update business process
 */
@Injectable()
export class UpdateEmployeeUseCase {
  private readonly logger = new Logger(UpdateEmployeeUseCase.name)

  /**
   * Constructor for UpdateEmployeeUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee update
   * @param id - Employee ID
   * @param updateEmployeeDto - Employee update data
   * @returns Result with updated employee response DTO or domain exception
   */
  async execute(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<
    Result<EmployeeResponseDto, EmployeeNotFoundException | EmployeeAlreadyExistsException>
  > {
    try {
      const currentUserId = this.userContextService.getUserId()
      const currentUserRole = this.userContextService.getUserRole()
      const currentEmployeeId = this.userContextService.getEmployeeId()

      this.logger.log('Executing update employee use case', {
        employeeId: id,
        email: updateEmployeeDto.email,
        requestedBy: currentUserId,
        requestedByRole: currentUserRole,
        requestedByEmployeeId: currentEmployeeId,
        context: 'UpdateEmployeeUseCase.execute',
      })

      // Authorization check: only admins or the employee themselves can update
      if (currentUserRole !== 'ADMIN' && currentEmployeeId !== id) {
        const error = new Error('Employees can only update their own profile')
        this.logger.warn('Unauthorized employee update attempt', {
          employeeId: id,
          requestedBy: currentUserId,
          requestedByRole: currentUserRole,
          requestedByEmployeeId: currentEmployeeId,
          context: 'UpdateEmployeeUseCase.execute',
        })
        return new Failure(error)
      }

      // Check if employee exists
      const existingEmployee = await this.employeeRepository.findById(id)
      if (!existingEmployee) {
        const error = new EmployeeNotFoundException(id)
        this.logger.warn('Employee not found for update', {
          employeeId: id,
          requestedBy: currentUserId,
          context: 'UpdateEmployeeUseCase.execute',
        })
        return new Failure(error)
      }

      // Validate employee update
      EmployeeUpdateValidator.validateEmployeeUpdate(updateEmployeeDto.name, updateEmployeeDto.role)

      const updatedEmployee = EmployeeMapper.fromUpdateDto(updateEmployeeDto, existingEmployee)
      const savedEmployee = await this.employeeRepository.update(id, updatedEmployee)
      const responseDto = EmployeeMapper.toResponseDto(savedEmployee)

      this.logger.log('Employee update use case completed successfully', {
        employeeId: id,
        email: responseDto.email,
        requestedBy: currentUserId,
        context: 'UpdateEmployeeUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error updating employee', {
        employeeId: id,
        email: updateEmployeeDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateEmployeeUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new EmployeeNotFoundException(id),
      )
    }
  }
}
