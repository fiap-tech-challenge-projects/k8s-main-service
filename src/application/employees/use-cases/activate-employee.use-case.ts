import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for activating an employee
 * Handles the orchestration for activating an employee account
 */
@Injectable()
export class ActivateEmployeeUseCase {
  private readonly logger = new Logger(ActivateEmployeeUseCase.name)

  /**
   * Constructor for ActivateEmployeeUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the activate employee use case
   * @param id - Employee ID to activate
   * @returns Result with activated employee or error
   */
  async execute(id: string): Promise<Result<EmployeeResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Activate employee use case started', {
        employeeId: id,
        requestedBy: currentUserId,
        context: 'ActivateEmployeeUseCase.execute',
      })

      // Check if employee exists
      const existingEmployee = await this.employeeRepository.findById(id)
      if (!existingEmployee) {
        const error = new EmployeeNotFoundException(id)
        this.logger.warn('Employee not found for activation', {
          employeeId: id,
          requestedBy: currentUserId,
          context: 'ActivateEmployeeUseCase.execute',
        })
        return new Failure(error)
      }

      // Activate employee
      existingEmployee.activate()
      const updatedEmployee = await this.employeeRepository.update(id, existingEmployee)
      const responseDto = EmployeeMapper.toResponseDto(updatedEmployee)

      this.logger.log('Activate employee use case completed successfully', {
        employeeId: responseDto.id,
        email: responseDto.email,
        requestedBy: currentUserId,
        context: 'ActivateEmployeeUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error activating employee', {
        employeeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'ActivateEmployeeUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
