import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting an employee by ID
 * Handles the orchestration for employee retrieval business process
 */
@Injectable()
export class GetEmployeeByIdUseCase {
  private readonly logger = new Logger(GetEmployeeByIdUseCase.name)

  /**
   * Constructor for GetEmployeeByIdUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee retrieval by ID
   * @param id - Employee ID
   * @returns Result with employee response DTO or error
   */
  async execute(id: string): Promise<Result<EmployeeResponseDto, EmployeeNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get employee by ID use case', {
        employeeId: id,
        requestedBy: currentUserId,
        context: 'GetEmployeeByIdUseCase.execute',
      })

      const employee = await this.employeeRepository.findById(id)
      if (!employee) {
        const error = new EmployeeNotFoundException(id)
        this.logger.warn('Employee not found', {
          employeeId: id,
          requestedBy: currentUserId,
          context: 'GetEmployeeByIdUseCase.execute',
        })
        return new Failure(error)
      }

      const responseDto = EmployeeMapper.toResponseDto(employee)

      this.logger.log('Get employee by ID use case completed successfully', {
        employeeId: id,
        requestedBy: currentUserId,
        context: 'GetEmployeeByIdUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting employee by ID', {
        employeeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetEmployeeByIdUseCase.execute',
      })
      return new Failure(new EmployeeNotFoundException(id))
    }
  }
}
