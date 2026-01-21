import { IBaseRepository } from '@shared/bases'

import { RefreshToken } from '../entities'

/**
 * Symbol token for refresh token repository injection
 */
export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY')

/**
 * Interface for refresh token repository operations
 */
export interface IRefreshTokenRepository extends IBaseRepository<RefreshToken> {
  /**
   * Find refresh token by token string
   * @param token - Refresh token string
   * @returns RefreshToken entity or null if not found
   */
  findByToken(token: string): Promise<RefreshToken | null>

  /**
   * Find all refresh tokens for a user
   * @param userId - User ID
   * @returns Array of refresh tokens
   */
  findByUserId(userId: string): Promise<RefreshToken[]>

  /**
   * Delete all refresh tokens for a user
   * @param userId - User ID
   */
  deleteByUserId(userId: string): Promise<void>

  /**
   * Delete expired refresh tokens
   */
  deleteExpired(): Promise<void>
}
