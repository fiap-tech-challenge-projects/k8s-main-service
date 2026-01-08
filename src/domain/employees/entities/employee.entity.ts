import { BaseEntity } from '@shared'

import { Email } from '../value-objects'

/**
 * Employee entity representing a workshop employee
 */
export class Employee extends BaseEntity {
  private _name: string

  private _email: Email

  private _phone?: string

  private _role: string

  private _specialty?: string

  private _isActive: boolean

  /**
   * Constructor for Employee entity
   * @param id - Unique identifier
   * @param name - Employee's full name
   * @param email - Employee's email address
   * @param role - Employee's role in the workshop
   * @param phone - Employee's phone number (optional)
   * @param specialty - Employee's specialty (optional)
   * @param isActive - Whether the employee is active
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  constructor(
    id: string,
    name: string,
    email: Email,
    role: string,
    phone?: string,
    specialty?: string,
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(id, createdAt, updatedAt)
    this._name = name
    this._email = email
    this._role = role
    this._phone = phone
    this._specialty = specialty
    this._isActive = isActive
  }

  // Getters for accessing private properties
  /**
   * Gets the employee's name.
   * @returns The employee's name
   */
  get name(): string {
    return this._name
  }

  /**
   * Gets the employee's email.
   * @returns The employee's email
   */
  get email(): Email {
    return this._email
  }

  /**
   * Gets the employee's phone number.
   * @returns The employee's phone number or undefined if not set
   */
  get phone(): string | undefined {
    return this._phone
  }

  /**
   * Gets the employee's role.
   * @returns The employee's role
   */
  get role(): string {
    return this._role
  }

  /**
   * Gets the employee's specialty.
   * @returns The employee's specialty or undefined if not set
   */
  get specialty(): string | undefined {
    return this._specialty
  }

  /**
   * Gets whether the employee is active.
   * @returns True if the employee is active, false otherwise
   */
  get isActive(): boolean {
    return this._isActive
  }

  /**
   * Create a new Employee entity
   * @param name - Employee's full name
   * @param email - Employee's email address
   * @param role - Employee's role in the workshop
   * @param phone - Employee's phone number (optional)
   * @param specialty - Employee's specialty (optional)
   * @param isActive - Whether the employee is active
   * @returns New Employee entity
   */
  public static create(
    name: string,
    email: string,
    role: string,
    phone?: string,
    specialty?: string,
    isActive: boolean = true,
  ): Employee {
    const emailValueObject = Email.create(email)
    const now = new Date()

    return new Employee('', name, emailValueObject, role, phone, specialty, isActive, now, now)
  }

  /**
   * Update employee name
   * @param name - New name
   */
  public updateName(name: string): void {
    this._name = name
    this.updatedAt = new Date()
  }

  /**
   * Update employee email
   * @param email - New email
   */
  public updateEmail(email: string): void {
    this._email = Email.create(email)
    this.updatedAt = new Date()
  }

  /**
   * Update employee role
   * @param role - New role
   */
  public updateRole(role: string): void {
    this._role = role
    this.updatedAt = new Date()
  }

  /**
   * Update employee phone
   * @param phone - New phone
   */
  public updatePhone(phone?: string): void {
    this._phone = phone
    this.updatedAt = new Date()
  }

  /**
   * Update employee specialty
   * @param specialty - New specialty
   */
  public updateSpecialty(specialty?: string): void {
    this._specialty = specialty
    this.updatedAt = new Date()
  }

  /**
   * Update employee active status
   * @param isActive - New active status
   */
  public updateIsActive(isActive: boolean): void {
    this._isActive = isActive
    this.updatedAt = new Date()
  }

  /**
   * Check if employee has a phone number
   * @returns True if employee has a phone number, false otherwise
   */
  public hasPhone(): boolean {
    return this._phone !== undefined && this._phone !== null && this._phone.trim() !== ''
  }

  /**
   * Check if employee has a specialty
   * @returns True if employee has a specialty, false otherwise
   */
  public hasSpecialty(): boolean {
    return (
      this._specialty !== undefined && this._specialty !== null && this._specialty.trim() !== ''
    )
  }

  /**
   * Get employee's normalized email
   * @returns Normalized email string
   */
  public getNormalizedEmail(): string {
    return this._email.normalized
  }

  /**
   * Activate the employee
   */
  public activate(): void {
    this.updateIsActive(true)
  }

  /**
   * Deactivate the employee
   */
  public deactivate(): void {
    this.updateIsActive(false)
  }
}
