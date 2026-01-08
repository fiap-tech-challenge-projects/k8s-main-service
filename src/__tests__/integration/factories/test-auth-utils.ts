import { INestApplication } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import * as jwt from 'jsonwebtoken'
import * as request from 'supertest'

import { UserContextService } from '@shared/services/user-context.service'

/**
 * Test authentication utilities for integration tests.
 * Provides reusable methods for setting up authentication and user context.
 */
export class TestAuthUtils {
  constructor(
    private readonly app: INestApplication,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Creates a JWT token by logging in with the provided credentials.
   * @param email - User email
   * @param password - User password
   * @returns JWT access token
   */
  async login(email: string, password: string): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)

    return response.body.accessToken
  }

  /**
   * Creates a test JWT token for a user without going through registration.
   * This is useful for integration tests where users are created by the test data factory.
   * @param userData - User data for token creation
   * @returns JWT access token
   */
  createTestToken(userData: {
    id: string
    email: string
    role: UserRole
    clientId?: string
    employeeId?: string
  }): string {
    const payload = {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
      clientId: userData.clientId,
      employeeId: userData.employeeId,
    }

    const secret = process.env.JWT_SECRET ?? 'test-jwt-secret-key-for-testing-only-32-chars-minimum'
    return jwt.sign(payload, secret, { expiresIn: '1h' })
  }

  /**
   * Sets up user context for a specific user.
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @param clientId - Client ID (optional)
   * @param employeeId - Employee ID (optional)
   */
  setupUserContext(
    userId: string,
    email: string,
    role: UserRole,
    clientId?: string,
    employeeId?: string,
  ): void {
    this.userContextService.setUserContext({
      userId,
      email,
      role,
      clientId,
      employeeId,
    })
  }

  /**
   * Sets up user context based on a JWT token.
   * This decodes the token and sets the user context accordingly.
   * @param token - JWT token to decode
   */
  async setupUserContextFromToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any
      if (decoded && decoded.sub && decoded.email && decoded.role) {
        this.setupUserContext(
          decoded.sub,
          decoded.email,
          decoded.role as UserRole,
          decoded.clientId,
          decoded.employeeId,
        )
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error)
    }
  }

  /**
   * Clears the current user context.
   */
  clearUserContext(): void {
    this.userContextService.clearUserContext()
  }

  /**
   * Makes an authenticated request using the provided token.
   * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param url - Request URL
   * @param token - JWT token for authentication
   * @param data - Request data (optional)
   * @returns Promise that resolves to the response
   */
  async makeAuthenticatedRequest(method: string, url: string, token: string, data?: any) {
    await this.setupUserContextFromToken(token)

    const req = request(this.app.getHttpServer())
      [method.toLowerCase()](url)
      .set('Authorization', `Bearer ${token}`)

    if (data) {
      req.send(data)
    }

    return await req
  }

  /**
   * Creates all auth tokens using test JWT creation (bypassing login API).
   * This is useful when the login API is not working properly.
   * @param testData - Test data containing user information
   * @returns Object containing all three tokens
   */
  createAllTestTokens(testData: {
    adminUser: { id: string; email: string }
    employeeUser: { id: string; email: string; employeeId: string }
    clientUser: { id: string; email: string; clientId: string }
  }): {
    adminToken: string
    employeeToken: string
    clientToken: string
  } {
    const adminToken = this.createTestToken({
      id: testData.adminUser.id,
      email: testData.adminUser.email,
      role: UserRole.ADMIN,
    })

    const employeeToken = this.createTestToken({
      id: testData.employeeUser.id,
      email: testData.employeeUser.email,
      role: UserRole.EMPLOYEE,
      employeeId: testData.employeeUser.employeeId,
    })

    const clientToken = this.createTestToken({
      id: testData.clientUser.id,
      email: testData.clientUser.email,
      role: UserRole.CLIENT,
      clientId: testData.clientUser.clientId,
    })

    return {
      adminToken,
      employeeToken,
      clientToken,
    }
  }

  /**
   * Creates all auth tokens by calling the login API.
   * @param adminCredentials - Admin login credentials
   * @param employeeCredentials - Employee login credentials
   * @param clientCredentials - Client login credentials
   * @returns Promise resolving to object containing all three tokens
   */
  async createAllAuthTokens(
    adminCredentials: { email: string; password: string },
    employeeCredentials: { email: string; password: string },
    clientCredentials: { email: string; password: string },
  ): Promise<{
    adminToken: string
    employeeToken: string
    clientToken: string
  }> {
    const [adminToken, employeeToken, clientToken] = await Promise.all([
      this.login(adminCredentials.email, adminCredentials.password),
      this.login(employeeCredentials.email, employeeCredentials.password),
      this.login(clientCredentials.email, clientCredentials.password),
    ])

    return {
      adminToken,
      employeeToken,
      clientToken,
    }
  }

  /**
   * Sets up user context for admin user.
   * @param userId - Admin user ID
   * @param email - Admin user email
   */
  setupAdminContext(userId: string, email: string): void {
    this.setupUserContext(userId, email, UserRole.ADMIN)
  }

  /**
   * Sets up user context for employee user.
   * @param userId - Employee user ID
   * @param email - Employee user email
   * @param employeeId - Employee ID
   */
  setupEmployeeContext(userId: string, email: string, employeeId: string): void {
    this.setupUserContext(userId, email, UserRole.EMPLOYEE, undefined, employeeId)
  }

  /**
   * Sets up user context for client user.
   * @param userId - Client user ID
   * @param email - Client user email
   * @param clientId - Client ID
   */
  setupClientContext(userId: string, email: string, clientId: string): void {
    this.setupUserContext(userId, email, UserRole.CLIENT, clientId)
  }
}
