import { UserRole } from '@prisma/client'

import { BaseEntity } from '@shared/bases'
import { Email } from '@shared/value-objects'

/**
 * User entity representing an authenticated user in the system
 *
 * This entity encapsulates user authentication and authorization data,
 * including email, password, role, and associated client or employee relationships.
 *
 * The User entity follows the Domain-Driven Design principles by:
 * - Encapsulating user-related business logic
 * - Providing immutable operations that return new instances
 * - Using value objects for email validation
 * - Maintaining referential integrity with client and employee entities
 */
export class User extends BaseEntity {
  public readonly email: Email
  public readonly password: string
  public readonly role: UserRole
  public readonly isActive: boolean
  public readonly lastLoginAt: Date | null
  public readonly clientId: string | null
  public readonly employeeId: string | null

  /**
   * Constructor for User entity
   *
   * @param id - Unique identifier for the user
   * @param email - User's email address (Email value object)
   * @param password - User's hashed password
   * @param role - User's role in the system (CLIENT, EMPLOYEE, ADMIN)
   * @param isActive - Whether the user account is active
   * @param lastLoginAt - Timestamp of user's last login (null if never logged in)
   * @param clientId - Associated client ID (null if not a client)
   * @param employeeId - Associated employee ID (null if not an employee)
   * @param createdAt - Timestamp when the user was created
   * @param updatedAt - Timestamp when the user was last updated
   */
  constructor(
    id: string,
    email: Email,
    password: string,
    role: UserRole,
    isActive: boolean,
    lastLoginAt: Date | null,
    clientId: string | null,
    employeeId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt)
    this.email = email
    this.password = password
    this.role = role
    this.isActive = isActive
    this.lastLoginAt = lastLoginAt
    this.clientId = clientId
    this.employeeId = employeeId
  }

  /**
   * Create a new User entity
   *
   * This factory method creates a new user with default values and validates
   * the provided data using value objects and business rules.
   *
   * @param email - User's email address (will be validated and normalized)
   * @param password - User's hashed password
   * @param role - User's role in the system (defaults to CLIENT)
   * @param clientId - Associated client ID (optional, required for CLIENT role)
   * @param employeeId - Associated employee ID (optional, required for EMPLOYEE role)
   * @returns New User entity with generated timestamps
   * @throws InvalidValueException if email is invalid
   */
  public static create(
    email: string,
    password: string,
    role: UserRole = UserRole.CLIENT,
    clientId?: string,
    employeeId?: string,
  ): User {
    const emailValueObject = Email.create(email)
    const now = new Date()

    return new User(
      '',
      emailValueObject,
      password,
      role,
      true,
      null,
      clientId ?? null,
      employeeId ?? null,
      now,
      now,
    )
  }

  /**
   * Update user's last login timestamp
   *
   * Creates a new User instance with the current timestamp as lastLoginAt
   * and updates the updatedAt timestamp. This method is immutable and
   * follows the domain entity pattern of returning new instances.
   *
   * @returns New User entity with updated lastLoginAt and updatedAt timestamps
   */
  public updateLastLogin(): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.role,
      this.isActive,
      new Date(),
      this.clientId,
      this.employeeId,
      this.createdAt,
      new Date(),
    )
  }

  /**
   * Deactivate user account
   *
   * Creates a new User instance with isActive set to false and updates
   * the updatedAt timestamp. This method is immutable and follows the
   * domain entity pattern of returning new instances.
   *
   * @returns New User entity with isActive set to false
   */
  public deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.role,
      false,
      this.lastLoginAt,
      this.clientId,
      this.employeeId,
      this.createdAt,
      new Date(),
    )
  }

  /**
   * Activate user account
   *
   * Creates a new User instance with isActive set to true and updates
   * the updatedAt timestamp. This method is immutable and follows the
   * domain entity pattern of returning new instances.
   *
   * @returns New User entity with isActive set to true
   */
  public activate(): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.role,
      true,
      this.lastLoginAt,
      this.clientId,
      this.employeeId,
      this.createdAt,
      new Date(),
    )
  }

  /**
   * Check if user is a client
   *
   * @returns True if user has CLIENT role, false otherwise
   */
  public isClient(): boolean {
    return this.role === UserRole.CLIENT
  }

  /**
   * Check if user is an employee
   *
   * @returns True if user has EMPLOYEE role, false otherwise
   */
  public isEmployee(): boolean {
    return this.role === UserRole.EMPLOYEE
  }

  /**
   * Check if user is an admin
   *
   * @returns True if user has ADMIN role, false otherwise
   */
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN
  }

  /**
   * Get the normalized email address
   *
   * @returns Normalized email string (lowercase)
   */
  public getNormalizedEmail(): string {
    return this.email.normalized
  }

  /**
   * Get the email domain
   *
   * @returns Domain part of the email address
   */
  public getEmailDomain(): string {
    return this.email.domain
  }

  /**
   * Get the email local part
   *
   * @returns Local part of the email address (before @)
   */
  public getEmailLocalPart(): string {
    return this.email.localPart
  }
}
