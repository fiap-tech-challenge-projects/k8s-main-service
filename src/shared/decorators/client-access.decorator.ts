import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { UserRole } from '@prisma/client'

/**
 * Decorator to ensure client access control
 * Validates that the authenticated user has access to the specified client data
 *
 * @param data - The parameter name containing the clientId (default: 'clientId')
 * @param ctx - The execution context
 * @returns The clientId if access is granted
 * @throws UnauthorizedException if access is denied
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ClientAccess = createParamDecorator((data: string, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest() as {
    user: { role: string; clientId?: string }
    params: Record<string, string>
  }
  const user = request.user
  const clientId = request.params[data || 'clientId']

  if (!user) {
    throw new UnauthorizedException('User not authenticated')
  }

  if (!clientId) {
    throw new UnauthorizedException('Client ID is required')
  }

  // Admins and employees can access any client data
  if (user.role === UserRole.ADMIN || user.role === UserRole.EMPLOYEE) {
    return clientId
  }

  // Clients can only access their own data
  if (user.role === UserRole.CLIENT) {
    if (user.clientId === clientId) {
      return clientId
    }
    throw new UnauthorizedException('Access denied - can only access own data')
  }

  throw new UnauthorizedException('Invalid user role')
})
