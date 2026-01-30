import { SetMetadata } from '@nestjs/common'
import { UserRole } from '@prisma/client'

/**
 * Metadata key for roles
 */
export const ROLES_KEY = 'roles'

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of required roles
 * @returns Metadata decorator
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
