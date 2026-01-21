import { registerAs } from '@nestjs/config'
import { z } from 'zod'

/**
 * Schema for authentication configuration validation
 */
export const AUTH_CONFIG_SCHEMA = z.object({
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters long'),
  jwtExpiresIn: z.string().default('24h'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  bcryptRounds: z.number().min(10).max(14).default(12),
})

/**
 * Authentication configuration
 */
export default registerAs('auth', () => {
  const config = {
    jwtSecret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  }

  // Validate the config
  const result = AUTH_CONFIG_SCHEMA.safeParse(config)
  if (!result.success) {
    throw new Error(`Auth configuration validation failed: ${result.error.message}`)
  }

  return result.data
})
