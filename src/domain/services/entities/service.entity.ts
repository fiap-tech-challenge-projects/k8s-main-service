import { BaseEntity } from '@shared'

import { ServiceNameValidator, ServiceDescriptionValidator } from '../validators'
import { EstimatedDuration, Price } from '../value-objects'

/**
 * Services entity representing a service offered by the mechanical workshop
 */
export class Service extends BaseEntity {
  private _name: string
  private _price: Price
  private _description: string
  private _estimatedDuration: EstimatedDuration

  /**
   * Constructs a new Service instance
   * @param id - The unique identifier of the service
   * @param name - The name of the service
   * @param price - The price of the service as a Price value object
   * @param description - The description of the service
   * @param estimatedDuration - The estimated duration of the service
   * @param createdAt - The creation date of the service
   * @param updatedAt - The last updated date of the service
   */
  constructor(
    id: string,
    name: string,
    price: Price,
    description: string,
    estimatedDuration: EstimatedDuration,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt ?? new Date(), updatedAt ?? new Date())
    this._name = name
    this._price = price
    this._description = description
    this._estimatedDuration = estimatedDuration
  }

  // Getters for accessing private properties
  /**
   * Gets the service name.
   * @returns The service name
   */
  get name(): string {
    return this._name
  }

  /**
   * Gets the service price.
   * @returns The service price
   */
  get price(): Price {
    return this._price
  }

  /**
   * Gets the service description.
   * @returns The service description
   */
  get description(): string {
    return this._description
  }

  /**
   * Gets the service estimated duration.
   * @returns The service estimated duration
   */
  get estimatedDuration(): EstimatedDuration {
    return this._estimatedDuration
  }

  /**
   * Factory method to create a new Service instance
   * @param name - The name of the service
   * @param price - The price of the service
   * @param description - The description of the service
   * @param estimatedDuration - The estimated duration of the service
   * @returns A new Service instance
   */
  public static create(
    name: string,
    price: string,
    description: string,
    estimatedDuration: string,
  ): Service {
    ServiceNameValidator.validate(name)
    ServiceDescriptionValidator.validate(description)

    const priceValueObject = Price.create(price)
    const estimatedDurationValueObject = EstimatedDuration.create(estimatedDuration)

    return new Service(
      '',
      name.trim(),
      priceValueObject,
      description.trim(),
      estimatedDurationValueObject,
    )
  }

  /**
   * Updates the name of the service.
   * @param name - The new name
   */
  updateName(name: string): void {
    ServiceNameValidator.validate(name)
    this._name = name.trim()
    this.updateTimestamp()
  }

  /**
   * Updates the description of the service.
   * @param description - The new description
   */
  updateDescription(description: string): void {
    ServiceDescriptionValidator.validate(description)
    this._description = description.trim()
    this.updateTimestamp()
  }

  /**
   * Updates the price of the service.
   * @param price - The new price as a string
   */
  updatePrice(price: string): void {
    const priceValueObject = Price.create(price)
    this._price = priceValueObject
    this.updateTimestamp()
  }

  /**
   * Updates the estimated duration of the service.
   * @param estimatedDuration - The new estimated duration as a string
   */
  updateEstimatedDuration(estimatedDuration: string): void {
    const estimatedDurationValueObject = EstimatedDuration.create(estimatedDuration)
    this._estimatedDuration = estimatedDurationValueObject
    this.updateTimestamp()
  }

  /**
   * Returns the price formatted as a string in the European format (e.g., "1.234,56").
   *
   * @returns The formatted price string
   */
  public getFormattedPrice(): string {
    return this._price.getFormatted()
  }

  /**
   * Returns the estimated duration formatted as a string in "MM:SS" format.
   *
   * @returns The formatted estimated duration string
   */
  public getFormattedDuration(): string {
    return this._estimatedDuration.getFormatted()
  }

  /**
   * Updates the timestamp to current time.
   */
  private updateTimestamp(): void {
    this.updatedAt = new Date()
  }
}
