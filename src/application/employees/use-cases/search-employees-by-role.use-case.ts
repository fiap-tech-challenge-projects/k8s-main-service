import { Injectable, Logger, Inject } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { PaginatedResult } from '@shared/bases'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for searching employees by role
 * Handles the orchestration for searching employees by role with pagination
 */
@Injectable()
export class SearchEmployeesByRoleUseCase {
  private readonly logger = new Logger(SearchEmployeesByRoleUseCase.name)

  /**
   * Constructor for SearchEmployeesByRoleUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the search employees by role use case
   * @param role - Role to search for
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated employees or error
   */
  async execute(
    role: UserRole,
    page: number = 1,
    limit: number = 10,
  ): Promise<Result<PaginatedResult<EmployeeResponseDto>, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Search employees by role use case started', {
        role,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'SearchEmployeesByRoleUseCase.execute',
      })

      const employeesResult = await this.employeeRepository.findByRole(role, page, limit)
      const responseDtos = employeesResult.data.map((employee) =>
        EmployeeMapper.toResponseDto(employee),
      )

      const result: PaginatedResult<EmployeeResponseDto> = {
        data: responseDtos,
        meta: employeesResult.meta,
      }

      this.logger.log('Search employees by role use case completed successfully', {
        role,
        totalEmployees: result.meta.total,
        pageSize: result.data.length,
        requestedBy: currentUserId,
        context: 'SearchEmployeesByRoleUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error searching employees by role', {
        role,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'SearchEmployeesByRoleUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
