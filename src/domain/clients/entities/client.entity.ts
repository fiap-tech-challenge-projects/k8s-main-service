import { BaseEntity, Email } from '@shared'

import { CpfCnpj } from '../value-objects'

/**
 * Client entity representing a customer in the mechanical workshop system
 */
export class Client extends BaseEntity {
  /**
   * Client's full name
   */
  private _name: string

  /**
   * Client's email address
   */
  private _email: Email

  /**
   * Client's phone number (optional)
   */
  private _phone?: string

  /**
   * Client's CPF or CNPJ (Brazilian taxpayer registration)
   */
  private readonly _cpfCnpj: CpfCnpj

  /**
   * Client's address (optional)
   */
  private _address?: string

  /**
   * Constructor for Client entity
   * @param id - Unique identifier
   * @param name - Client's full name
   * @param email - Client's email address
   * @param cpfCnpj - Client's CPF or CNPJ
   * @param phone - Client's phone number (optional)
   * @param address - Client's address (optional)
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  constructor(
    id: string,
    name: string,
    email: Email,
    cpfCnpj: CpfCnpj,
    phone?: string,
    address?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(id, createdAt, updatedAt)
    this._name = name
    this._email = email
    this._cpfCnpj = cpfCnpj
    this._phone = phone
    this._address = address
  }

  // Getters for accessing private properties
  /**
   * Gets the client's name.
   * @returns The client's name
   */
  get name(): string {
    return this._name
  }

  /**
   * Gets the client's email.
   * @returns The client's email
   */
  get email(): Email {
    return this._email
  }

  /**
   * Gets the client's phone number.
   * @returns The client's phone number or undefined if not set
   */
  get phone(): string | undefined {
    return this._phone
  }

  /**
   * Gets the client's CPF or CNPJ.
   * @returns The client's CPF or CNPJ
   */
  get cpfCnpj(): CpfCnpj {
    return this._cpfCnpj
  }

  /**
   * Gets the client's address.
   * @returns The client's address or undefined if not set
   */
  get address(): string | undefined {
    return this._address
  }

  /**
   * Create a new Client entity
   * @param name - Client's full name
   * @param email - Client's email address
   * @param cpfCnpj - Client's CPF or CNPJ
   * @param phone - Client's phone number (optional)
   * @param address - Client's address (optional)
   * @returns New Client entity
   */
  public static create(
    name: string,
    email: string,
    cpfCnpj: string,
    phone?: string,
    address?: string,
  ): Client {
    const emailValueObject = Email.create(email)
    const cpfCnpjValueObject = CpfCnpj.create(cpfCnpj)
    const now = new Date()

    return new Client(
      `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      emailValueObject,
      cpfCnpjValueObject,
      phone,
      address,
      now,
      now,
    )
  }

  /**
   * Update client name
   * @param name - New name
   */
  public updateName(name: string): void {
    this._name = name
    this.updateTimestamp()
  }

  /**
   * Update client email
   * @param email - New email
   */
  public updateEmail(email: string): void {
    this._email = Email.create(email)
    this.updateTimestamp()
  }

  /**
   * Update client phone
   * @param phone - New phone
   */
  public updatePhone(phone?: string): void {
    this._phone = phone
    this.updateTimestamp()
  }

  /**
   * Update client address
   * @param address - New address
   */
  public updateAddress(address?: string): void {
    this._address = address
    this.updateTimestamp()
  }

  /**
   * Check if client has a phone number
   * @returns True if client has a phone number, false otherwise
   */
  public hasPhone(): boolean {
    return this._phone !== undefined && this._phone !== null && this._phone.trim() !== ''
  }

  /**
   * Check if client has an address
   * @returns True if client has an address, false otherwise
   */
  public hasAddress(): boolean {
    return this._address !== undefined && this._address !== null && this._address.trim() !== ''
  }

  /**
   * Get client's formatted CPF or CNPJ
   * @returns Formatted CPF or CNPJ string
   */
  public getFormattedCpfCnpj(): string {
    return this._cpfCnpj.formatted
  }

  /**
   * Get client's raw CPF/CNPJ (numbers only)
   * @returns Raw CPF/CNPJ string
   */
  public getRawCpfCnpj(): string {
    return this._cpfCnpj.clean
  }

  /**
   * Get client's normalized email
   * @returns Normalized email string
   */
  public getNormalizedEmail(): string {
    return this._email.normalized
  }

  /**
   * Updates the timestamp to current time.
   */
  private updateTimestamp(): void {
    this.updatedAt = new Date()
  }
}
