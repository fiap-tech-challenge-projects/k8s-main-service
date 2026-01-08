import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedEmployeesResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { Employee } from '@domain/employees/entities'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { Result, Success, Failure } from '@shared'
import { UserContextService } from '@shared/services/user-context.service'

/**
 * Use case for getting all employees
 * Handles the orchestration for employee listing business process
 */
@Injectable()
export class GetAllEmployeesUseCase {
  private readonly logger = new Logger(GetAllEmployeesUseCase.name)

  /**
   * Constructor for GetAllEmployeesUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee listing
   * @param page Page number for pagination (optional)
   * @param limit Number of items per page (optional)
   * @returns Result with paginated employee response or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedEmployeesResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()
      const currentUserRole = this.userContextService.getUserRole()
      const currentEmployeeId = this.userContextService.getEmployeeId()

      this.logger.log('Executing get all employees use case', {
        requestedBy: currentUserId,
        role: currentUserRole,
        employeeId: currentEmployeeId,
        page,
        limit,
        context: 'GetAllEmployeesUseCase.execute',
      })

      type EmployeesResult = {
        data: Employee[]
        meta: {
          total: number
          page: number
          limit: number
          totalPages: number
          hasNext: boolean
          hasPrev: boolean
        }
      }

      let employeesResult: EmployeesResult

      // If user is ADMIN, return all employees
      // If user is EMPLOYEE, return only their own data
      if (currentUserRole === 'ADMIN') {
        employeesResult = await this.employeeRepository.findAll(page, limit)
      } else if (currentUserRole === 'EMPLOYEE' && currentEmployeeId) {
        // For employees, find only their own data
        const employee = await this.employeeRepository.findById(currentEmployeeId)
        if (employee) {
          employeesResult = {
            data: [employee],
            meta: {
              total: 1,
              page: 1,
              limit: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          }
        } else {
          employeesResult = {
            data: [],
            meta: {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          }
        }
      } else {
        // For other roles or employees without employeeId, return empty result
        employeesResult = {
          data: [],
          meta: {
            total: 0,
            page: page ?? 1,
            limit: limit ?? 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      }

      const responseDtos = employeesResult.data.map((employee) =>
        EmployeeMapper.toResponseDto(employee),
      )

      const paginatedResponse: PaginatedEmployeesResponseDto = {
        data: responseDtos,
        meta: employeesResult.meta,
      }

      this.logger.log('Get all employees use case completed successfully', {
        employeeCount: responseDtos.length,
        totalPages: employeesResult.meta.totalPages,
        requestedBy: currentUserId,
        role: currentUserRole,
        context: 'GetAllEmployeesUseCase.execute',
      })

      return new Success(paginatedResponse)
    } catch (error) {
      this.logger.error('Error getting all employees', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetAllEmployeesUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
