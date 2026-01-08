import { UserRole } from '@prisma/client'
import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

/**
 * Integration tests for AuthController endpoints.
 * Tests all authentication-related functionality including registration, login, refresh, logout, and profile.
 */
describe('AuthController Integration Tests', () => {
  let testBase: IntegrationTestBase
  let dataFactory: IntegrationTestDataFactory

  beforeAll(async () => {
    testBase = new IntegrationTestBase()
    await testBase.beforeAll()
    dataFactory = new IntegrationTestDataFactory(testBase.prismaService)
  })

  afterAll(async () => {
    await testBase.afterAll()
  })

  afterEach(async () => {
    await testBase.afterEach()
    if (dataFactory) {
      dataFactory.resetTestData()
    }
  })

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const registerData = {
        email: 'newuser@test.com',
        password: 'TestPassword123!',
        role: UserRole.CLIENT,
        clientId: testData.client.id, // Required for CLIENT role
      }

      const response = await request(testBase.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(registerData.email)
    })

    it('should return 400 for invalid registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // too short
        role: 'INVALID_ROLE',
      }

      await request(testBase.getHttpServer()).post('/auth/register').send(invalidData).expect(400)
    })

    it('should return 409 when email already exists', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const registerData = {
        email: testData.clientUser.email, // existing email
        password: 'TestPassword123!',
        role: UserRole.CLIENT,
        clientId: testData.client.id, // Required for CLIENT role
      }

      await request(testBase.getHttpServer()).post('/auth/register').send(registerData).expect(409)
    })
  })

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const loginData = {
        email: testData.clientUser.email,
        password: 'TestPassword123!', // Use the actual test password from factory
      }

      const response = await request(testBase.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(loginData.email)
    })

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'wrongpassword',
      }

      await request(testBase.getHttpServer()).post('/auth/login').send(loginData).expect(401)
    })

    it('should return 400 for missing credentials', async () => {
      await request(testBase.getHttpServer()).post('/auth/login').send({}).expect(400)
    })
  })

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      // First login to get refresh token
      const loginResponse = await request(testBase.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.clientUser.email,
          password: 'TestPassword123!',
        })
        .expect(200)

      const refreshTokenData = {
        refreshToken: loginResponse.body.refreshToken,
      }

      const response = await request(testBase.getHttpServer())
        .post('/auth/refresh')
        .send(refreshTokenData)
        .expect(200)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('user')
    })

    it('should return 401 for invalid refresh token', async () => {
      const refreshTokenData = {
        refreshToken: 'invalid-refresh-token',
      }

      await request(testBase.getHttpServer())
        .post('/auth/refresh')
        .send(refreshTokenData)
        .expect(401)
    })

    it('should return 400 for missing refresh token', async () => {
      await request(testBase.getHttpServer()).post('/auth/refresh').send({}).expect(400)
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      // Create a test token
      const token = testBase.authUtils.createTestToken({
        id: testData.clientUser.id,
        email: testData.clientUser.email,
        role: testData.clientUser.role,
        clientId: testData.client.id,
      })

      await request(testBase.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
    })

    it('should return 401 when no token provided', async () => {
      await request(testBase.getHttpServer()).post('/auth/logout').expect(401)
    })

    it('should return 401 when invalid token provided', async () => {
      await request(testBase.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('GET /auth/profile', () => {
    it('should get profile successfully with client token', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const token = testBase.authUtils.createTestToken({
        id: testData.clientUser.id,
        email: testData.clientUser.email,
        role: testData.clientUser.role,
        clientId: testData.client.id,
        employeeId: undefined,
      })

      const response = await request(testBase.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testData.clientUser.id)
      expect(response.body).toHaveProperty('email', testData.clientUser.email)
      expect(response.body).toHaveProperty('role', testData.clientUser.role)
      expect(response.body).toHaveProperty('clientId', testData.client.id)
      expect(response.body.employeeId).toBeFalsy() // Handle both null and undefined
    })

    it('should get profile successfully with employee token', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const token = testBase.authUtils.createTestToken({
        id: testData.employeeUser.id,
        email: testData.employeeUser.email,
        role: testData.employeeUser.role,
        clientId: undefined,
        employeeId: testData.employee.id,
      })

      const response = await request(testBase.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testData.employeeUser.id)
      expect(response.body).toHaveProperty('email', testData.employeeUser.email)
      expect(response.body).toHaveProperty('role', testData.employeeUser.role)
      expect(response.body).toHaveProperty('employeeId', testData.employee.id)
      expect(response.body.clientId).toBeFalsy() // Handle both null and undefined
    })

    it('should get profile successfully with admin token', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const token = testBase.authUtils.createTestToken({
        id: testData.adminUser.id,
        email: testData.adminUser.email,
        role: testData.adminUser.role,
        clientId: undefined,
        employeeId: undefined,
      })

      const response = await request(testBase.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testData.adminUser.id)
      expect(response.body).toHaveProperty('email', testData.adminUser.email)
      expect(response.body).toHaveProperty('role', testData.adminUser.role)
      expect(response.body.clientId).toBeFalsy() // Handle both null and undefined
      expect(response.body.employeeId).toBeFalsy() // Handle both null and undefined
    })

    it('should return 401 when no token provided', async () => {
      await request(testBase.getHttpServer()).get('/auth/profile').expect(401)
    })

    it('should return 401 when invalid token provided', async () => {
      await request(testBase.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })
})
