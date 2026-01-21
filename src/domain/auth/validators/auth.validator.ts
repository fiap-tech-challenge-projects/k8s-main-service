import { InvalidCredentialsException, InactiveUserException } from '@domain/auth/exceptions'

/**
 * Type for user entity with required properties
 */
export interface UserForValidation {
  email: string
  password: string
  isActive: boolean
}

/**
 * Type for user existence validation function
 */
export type UserExistsFunction = (email: string) => Promise<UserForValidation | null>

/**
 * Type for password validation function
 */
export type PasswordValidationFunction = (password: string, hash: string) => Promise<boolean>

/**
 * Validator for authentication business rules
 */
export class AuthValidator {
  /**
   * Validates user credentials for login
   * @param email - User email
   * @param password - Plain text password
   * @param user - User entity from repository
   * @param validatePassword - Function to validate password against hash
   * @throws InvalidCredentialsException if credentials are invalid
   * @throws InactiveUserException if user is inactive
   */
  public static async validateUserCredentials(
    email: string,
    password: string,
    user: UserForValidation | null,
    validatePassword: PasswordValidationFunction,
  ): Promise<void> {
    if (!user) {
      throw new InvalidCredentialsException()
    }

    const isPasswordValid = await validatePassword(password, user.password)
    if (!isPasswordValid) {
      throw new InvalidCredentialsException()
    }

    if (!user.isActive) {
      throw new InactiveUserException()
    }
  }

  /**
   * Validates if user exists by email
   * @param email - Email to check
   * @param userExists - Function to check if user exists
   * @returns User entity if exists
   * @throws InvalidCredentialsException if user doesn't exist
   */
  public static async validateUserExists(
    email: string,
    userExists: UserExistsFunction,
  ): Promise<UserForValidation> {
    const user = await userExists(email)
    if (!user) {
      throw new InvalidCredentialsException()
    }
    return user
  }

  /**
   * Validates if user is active
   * @param user - User entity
   * @throws InactiveUserException if user is inactive
   */
  public static validateUserActive(user: UserForValidation): void {
    if (!user.isActive) {
      throw new InactiveUserException()
    }
  }
}
