import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deactivating an employee
 * Handles the orchestration for deactivating an employee account
 */
@Injectable()
export class DeactivateEmployeeUseCase {
  private readonly logger = new Logger(DeactivateEmployeeUseCase.name)

  /**
   * Constructor for DeactivateEmployeeUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the deactivate employee use case
   * @param id - Employee ID to deactivate
   * @returns Result with deactivated employee or error
   */
  async execute(id: string): Promise<Result<EmployeeResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Deactivate employee use case started', {
        employeeId: id,
        requestedBy: currentUserId,
        context: 'DeactivateEmployeeUseCase.execute',
      })

      // Check if employee exists
      const existingEmployee = await this.employeeRepository.findById(id)
      if (!existingEmployee) {
        const error = new EmployeeNotFoundException(id)
        this.logger.warn('Employee not found for deactivation', {
          employeeId: id,
          requestedBy: currentUserId,
          context: 'DeactivateEmployeeUseCase.execute',
        })
        return new Failure(error)
      }

      // Deactivate employee
      existingEmployee.deactivate()
      const updatedEmployee = await this.employeeRepository.update(id, existingEmployee)
      const responseDto = EmployeeMapper.toResponseDto(updatedEmployee)

      this.logger.log('Deactivate employee use case completed successfully', {
        employeeId: responseDto.id,
        email: responseDto.email,
        requestedBy: currentUserId,
        context: 'DeactivateEmployeeUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error deactivating employee', {
        employeeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeactivateEmployeeUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
