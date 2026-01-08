import { BaseEntity } from '@shared/bases'

/**
 * VehicleEvaluation entity represents a mechanic's assessment of a vehicle
 * including technical details and recommendations.
 */
export class VehicleEvaluation extends BaseEntity {
  private _details: Record<string, unknown>
  private _evaluationDate: Date
  private _mechanicNotes?: string
  private _serviceOrderId: string
  private _vehicleId: string

  /**
   * Creates a new VehicleEvaluation instance
   * @param id - The unique identifier
   * @param serviceOrderId - The service order ID
   * @param vehicleId - The vehicle ID
   * @param details - The evaluation details
   * @param evaluationDate - The evaluation date
   * @param mechanicNotes - The mechanic notes
   * @param createdAt - The creation date
   * @param updatedAt - The last update date
   */
  constructor(
    id: string,
    serviceOrderId: string,
    vehicleId: string,
    details: Record<string, unknown>,
    evaluationDate: Date,
    mechanicNotes?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt ?? new Date(), updatedAt ?? new Date())
    this._details = details
    this._evaluationDate = evaluationDate
    this._mechanicNotes = mechanicNotes
    this._serviceOrderId = serviceOrderId
    this._vehicleId = vehicleId
  }

  /**
   * Gets the evaluation details
   * @returns The evaluation details
   */
  get details(): Record<string, unknown> {
    return this._details
  }

  /**
   * Gets the evaluation date
   * @returns The evaluation date
   */
  get evaluationDate(): Date {
    return this._evaluationDate
  }

  /**
   * Gets the mechanic notes
   * @returns The mechanic notes or undefined
   */
  get mechanicNotes(): string | undefined {
    return this._mechanicNotes
  }

  /**
   * Gets the service order ID
   * @returns The service order ID
   */
  get serviceOrderId(): string {
    return this._serviceOrderId
  }

  /**
   * Gets the vehicle ID
   * @returns The vehicle ID
   */
  get vehicleId(): string {
    return this._vehicleId
  }

  /**
   * Updates the evaluation details
   * @param details - The new evaluation details
   */
  updateDetails(details: Record<string, unknown>): void {
    this._details = details
  }

  /**
   * Updates the mechanic notes
   * @param notes - The new mechanic notes
   */
  updateMechanicNotes(notes: string): void {
    this._mechanicNotes = notes
  }

  /**
   * Adds a specific detail to the evaluation
   * @param key - The detail key
   * @param value - The detail value
   */
  addDetail(key: string, value: unknown): void {
    this._details[key] = value
  }

  /**
   * Gets a specific detail from the evaluation
   * @param key - The detail key
   * @returns The detail value
   */
  getDetail(key: string): unknown {
    return this._details[key]
  }

  /**
   * Checks if the evaluation has a specific detail
   * @param key - The detail key
   * @returns True if the detail exists, false otherwise
   */
  hasDetail(key: string): boolean {
    return key in this._details
  }
}
