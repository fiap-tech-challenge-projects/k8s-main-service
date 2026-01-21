import { BaseEntity } from '@shared/bases'

/**
 * RefreshToken entity representing a refresh token issued for JWT authentication flows.
 */
export class RefreshToken extends BaseEntity {
  public readonly token: string
  public readonly userId: string
  public readonly expiresAt: Date

  /**
   * Constructs a RefreshToken entity.
   * @param id Unique identifier for the refresh token.
   * @param token Refresh token string.
   * @param userId User ID that owns this token.
   * @param expiresAt Expiration timestamp for the token.
   * @param createdAt Creation timestamp used for both creation and update fields.
   */
  constructor(id: string, token: string, userId: string, expiresAt: Date, createdAt: Date) {
    super(id, createdAt, createdAt)
    this.token = token
    this.userId = userId
    this.expiresAt = expiresAt
  }

  /**
   * Factory to create a new RefreshToken entity using the current timestamp for creation metadata.
   * @param token Refresh token string.
   * @param userId User ID that owns this token.
   * @param expiresAt Expiration timestamp for the token.
   * @returns Newly created RefreshToken entity.
   */
  public static create(token: string, userId: string, expiresAt: Date): RefreshToken {
    const now = new Date()
    return new RefreshToken('', token, userId, expiresAt, now)
  }

  /**
   * Checks if the refresh token is expired relative to the provided or current timestamp.
   * @param currentDate Timestamp used to evaluate expiration; defaults to now.
   * @returns True when the token is already expired.
   */
  public isExpired(currentDate: Date = new Date()): boolean {
    return currentDate.getTime() > this.expiresAt.getTime()
  }

  /**
   * Checks if the refresh token remains valid (not expired) relative to the provided or current timestamp.
   * @param currentDate Timestamp used to evaluate validity; defaults to now.
   * @returns True when the token is still valid.
   */
  public isValid(currentDate: Date = new Date()): boolean {
    return !this.isExpired(currentDate)
  }
}
