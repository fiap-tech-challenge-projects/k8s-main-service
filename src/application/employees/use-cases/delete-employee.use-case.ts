import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting an employee
 * Handles the orchestration for employee deletion business process
 */
@Injectable()
export class DeleteEmployeeUseCase {
  private readonly logger = new Logger(DeleteEmployeeUseCase.name)

  /**
   * Constructor for DeleteEmployeeUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee deletion
   * @param id - Employee ID
   * @returns Result with success or domain exception
   */
  async execute(id: string): Promise<Result<void, EmployeeNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing delete employee use case', {
        employeeId: id,
        requestedBy: currentUserId,
        context: 'DeleteEmployeeUseCase.execute',
      })

      // Check if employee exists
      const existingEmployee = await this.employeeRepository.findById(id)
      if (!existingEmployee) {
        this.logger.log(
          'Employee not found for deletion - returning success for idempotent behavior',
          {
            employeeId: id,
            requestedBy: currentUserId,
            context: 'DeleteEmployeeUseCase.execute',
          },
        )
        return new Success(undefined)
      }

      await this.employeeRepository.delete(id)

      this.logger.log('Employee deletion use case completed successfully', {
        employeeId: id,
        requestedBy: currentUserId,
        context: 'DeleteEmployeeUseCase.execute',
      })

      return new Success(undefined)
    } catch (error) {
      this.logger.error('Error deleting employee', {
        employeeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteEmployeeUseCase.execute',
      })
      return new Failure(new EmployeeNotFoundException(id))
    }
  }
}
