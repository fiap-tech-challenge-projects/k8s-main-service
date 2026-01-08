import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when user credentials are invalid
 */
export class InvalidCredentialsException extends DomainException {
  /**
   *
   */
  constructor() {
    super('Invalid email or password', 'InvalidCredentialsException')
  }
}

/**
 * Exception thrown when user account is inactive
 */
export class InactiveUserException extends DomainException {
  /**
   *
   */
  constructor() {
    super('User account is inactive', 'InactiveUserException')
  }
}

/**
 * Exception thrown when email is already in use
 */
export class EmailAlreadyExistsException extends DomainException {
  /**
   * Constructor for EmailAlreadyExistsException
   * @param email - The email address that already exists
   */
  constructor(email: string) {
    super(`Email ${email} is already in use`, 'EmailAlreadyExistsException')
  }
}

/**
 * Exception thrown when refresh token is invalid
 */
export class InvalidRefreshTokenException extends DomainException {
  /**
   *
   */
  constructor() {
    super('Invalid or expired refresh token', 'InvalidRefreshTokenException')
  }
}

/**
 * Exception thrown when refresh token has expired
 */
export class ExpiredRefreshTokenException extends DomainException {
  /**
   *
   */
  constructor() {
    super('Refresh token has expired', 'ExpiredRefreshTokenException')
  }
}

/**
 * Exception thrown when user is not found
 */
export class UserNotFoundException extends DomainException {
  /**
   * Constructor for UserNotFoundException
   * @param userId - The user ID that was not found
   */
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'UserNotFoundException')
  }
}

/**
 * Exception thrown when user with email is not found
 */
export class UserNotFoundByEmailException extends DomainException {
  /**
   * Constructor for UserNotFoundByEmailException
   * @param email - The email address that was not found
   */
  constructor(email: string) {
    super(`User with email ${email} not found`, 'UserNotFoundByEmailException')
  }
}

/**
 * Exception thrown when admin role is not allowed during registration
 */
export class AdminRoleNotAllowedException extends DomainException {
  /**
   * Constructor for AdminRoleNotAllowedException
   */
  constructor() {
    super('Admin role is not allowed during user registration', 'AdminRoleNotAllowedException')
  }
}

/**
 * Exception thrown when client ID is required but not provided
 */
export class ClientIdRequiredException extends DomainException {
  /**
   * Constructor for ClientIdRequiredException
   */
  constructor() {
    super(
      'Client ID is required when creating a user with CLIENT role',
      'ClientIdRequiredException',
    )
  }
}

/**
 * Exception thrown when employee ID is required but not provided
 */
export class EmployeeIdRequiredException extends DomainException {
  /**
   * Constructor for EmployeeIdRequiredException
   */
  constructor() {
    super(
      'Employee ID is required when creating a user with EMPLOYEE role',
      'EmployeeIdRequiredException',
    )
  }
}
