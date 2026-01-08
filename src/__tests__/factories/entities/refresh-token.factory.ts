import { RefreshToken } from '@domain/auth/entities'

/**
 * Factory for creating RefreshToken entities for testing
 */
export class RefreshTokenFactory {
  /**
   * Create a valid RefreshToken entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns RefreshToken entity
   */
  public static create(
    overrides: Partial<{
      id: string
      token: string
      userId: string
      expiresAt: Date
      createdAt: Date
    }> = {},
  ): RefreshToken {
    const defaults = {
      id: `refresh-token-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      token: 'refresh-token-123',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new RefreshToken(data.id, data.token, data.userId, data.expiresAt, data.createdAt)
  }

  /**
   * Create an expired RefreshToken entity
   * @param overrides - Optional properties to override defaults
   * @returns RefreshToken entity
   */
  public static createExpired(
    overrides: Partial<{
      id: string
      token: string
      userId: string
      createdAt: Date
    }> = {},
  ): RefreshToken {
    const defaults = {
      id: `refresh-token-expired-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      token: 'expired-refresh-token-123',
      userId: 'user-123',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new RefreshToken(
      data.id,
      data.token,
      data.userId,
      new Date(Date.now() - 86400000), // 24 hours ago
      data.createdAt,
    )
  }

  /**
   * Create multiple RefreshToken entities
   * @param count - Number of refresh tokens to create
   * @param overrides - Optional properties to override defaults
   * @returns Array of RefreshToken entities
   */
  public static createMany(
    count: number,
    overrides: Partial<{
      id: string
      token: string
      userId: string
      expiresAt: Date
      createdAt: Date
    }> = {},
  ): RefreshToken[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...overrides,
        id: overrides.id ?? `refresh-token-test-${index + 1}`,
        token: overrides.token ?? `refresh-token-${index + 1}`,
      }),
    )
  }
}
