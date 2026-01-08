import { IBaseRepository } from '@shared/bases'

import { User } from '../entities'

/**
 * Symbol token for user repository injection
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

/**
 * Interface for user repository operations
 */
export interface IUserRepository extends IBaseRepository<User> {
  /**
   * Find user by email
   * @param email - User's email address
   * @returns User entity or null if not found
   */
  findByEmail(email: string): Promise<User | null>

  /**
   * Find user by client ID
   * @param clientId - Client ID
   * @returns User entity or null if not found
   */
  findByClientId(clientId: string): Promise<User | null>

  /**
   * Find user by employee ID
   * @param employeeId - Employee ID
   * @returns User entity or null if not found
   */
  findByEmployeeId(employeeId: string): Promise<User | null>

  /**
   * Check if email exists
   * @param email - Email to check
   * @returns True if email exists
   */
  emailExists(email: string): Promise<boolean>
}
