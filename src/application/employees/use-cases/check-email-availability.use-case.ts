import { Injectable, Logger, Inject } from '@nestjs/common'

import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for checking employee email availability
 * Handles the orchestration for employee email availability check business process
 */
@Injectable()
export class CheckEmailAvailabilityUseCase {
  private readonly logger = new Logger(CheckEmailAvailabilityUseCase.name)

  /**
   * Constructor for CheckEmailAvailabilityUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee email availability check
   * @param email - Employee email to check
   * @returns Result with availability status or error
   */
  async execute(email: string): Promise<Result<{ available: boolean }, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing check email availability use case', {
        email,
        requestedBy: currentUserId,
        context: 'CheckEmailAvailabilityUseCase.execute',
      })

      const emailExists = await this.employeeRepository.emailExists(email)
      const result = { available: !emailExists }

      this.logger.log('Check email availability use case completed successfully', {
        email,
        available: result.available,
        requestedBy: currentUserId,
        context: 'CheckEmailAvailabilityUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error checking email availability', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CheckEmailAvailabilityUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
