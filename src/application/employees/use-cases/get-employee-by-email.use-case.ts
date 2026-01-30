import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting an employee by email
 * Handles the orchestration for employee retrieval by email business process
 */
@Injectable()
export class GetEmployeeByEmailUseCase {
  private readonly logger = new Logger(GetEmployeeByEmailUseCase.name)

  /**
   * Constructor for GetEmployeeByEmailUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee retrieval by email
   * @param email - Employee email
   * @returns Result with employee response DTO or error
   */
  async execute(email: string): Promise<Result<EmployeeResponseDto, EmployeeNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get employee by email use case', {
        email,
        requestedBy: currentUserId,
        context: 'GetEmployeeByEmailUseCase.execute',
      })

      const employee = await this.employeeRepository.findByEmail(email)
      if (!employee) {
        const error = new EmployeeNotFoundException(`Employee with email ${email}`)
        this.logger.warn('Employee not found by email', {
          email,
          requestedBy: currentUserId,
          context: 'GetEmployeeByEmailUseCase.execute',
        })
        return new Failure(error)
      }

      const responseDto = EmployeeMapper.toResponseDto(employee)

      this.logger.log('Get employee by email use case completed successfully', {
        email,
        employeeId: responseDto.id,
        requestedBy: currentUserId,
        context: 'GetEmployeeByEmailUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting employee by email', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetEmployeeByEmailUseCase.execute',
      })
      return new Failure(new EmployeeNotFoundException(`Employee with email ${email}`))
    }
  }
}
