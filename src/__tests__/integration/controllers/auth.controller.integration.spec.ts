import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('AuthController Integration', () => {
  let testBase: IntegrationTestBase
  let dataFactory: IntegrationTestDataFactory
  let adminAuthToken: string

  beforeAll(async () => {
    testBase = new IntegrationTestBase()
    await testBase.beforeAll()
  })

  beforeEach(async () => {
    dataFactory = new IntegrationTestDataFactory(testBase.prismaService)
    await dataFactory.initializeTestData()
    const testData = dataFactory.getTestData()

    const tokens = testBase.authUtils.createAllTestTokens({
      adminUser: testData.adminUser,
      employeeUser: testData.employeeUser,
      clientUser: testData.clientUser,
    })

    adminAuthToken = tokens.adminToken
  })

  afterAll(async () => {
    await testBase.afterAll()
  })

  afterEach(async () => {
    if (dataFactory) {
      await dataFactory.cleanupTestData()
      dataFactory.resetTestData()
    }
    await testBase.afterEach()
  })

  describe('POST /auth/register', () => {
    it('should register a new client user successfully', async () => {
      const testData = dataFactory.getTestData()
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        role: 'CLIENT',
        clientId: testData.client.id,
      }

      const response = await request(testBase.getHttpServer())
        .post('/auth/register')
        .send(registerDto)

      console.log('Response status:', response.status)
      console.log('Response body:', response.body)
      console.log('Response headers:', response.headers)
      console.log('Request URL:', '/auth/register')
      console.log('Request body:', registerDto)

      expect(response.status).toBe(201)

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email: registerDto.email,
          role: registerDto.role,
          clientId: testData.client.id,
        },
      })
    })

    it('should register a new employee user successfully', async () => {
      const testData = dataFactory.getTestData()
      const registerDto = {
        email: 'employee@example.com',
        password: 'password123',
        role: 'EMPLOYEE',
        employeeId: testData.employee.id,
      }

      const response = await request(testBase.getHttpServer())
        .post('/auth/register')
        .send(registerDto)

      expect(response.status).toBe(201)

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email: registerDto.email,
          role: registerDto.role,
          employeeId: testData.employee.id,
        },
      })
    })

    it('should fail to register with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'password123',
        role: 'CLIENT',
      }

      await request(testBase.getHttpServer()).post('/auth/register').send(registerDto).expect(400)
    })

    it('should fail to register with existing email', async () => {
      const testData = dataFactory.getTestData()

      const registerDto = {
        email: testData.clientUser.email,
        password: 'password123',
        role: 'CLIENT',
        clientId: testData.client.id,
      }

      await request(testBase.getHttpServer()).post('/auth/register').send(registerDto).expect(409)
    })

    it('should fail to register with missing required fields', async () => {
      const registerDto = {
        email: 'test@example.com',
      }

      await request(testBase.getHttpServer()).post('/auth/register').send(registerDto).expect(400)
    })
  })

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const testData = dataFactory.getTestData()

      const loginDto = {
        email: testData.clientUser.email,
        password: 'TestPassword123!',
      }

      console.log('Login request URL:', '/auth/login')
      console.log('Login request body:', loginDto)

      const response = await request(testBase.getHttpServer()).post('/auth/login').send(loginDto)

      console.log('Login response status:', response.status)
      console.log('Login response body:', response.body)
      console.log('Login response headers:', response.headers)

      expect(response.status).toBe(200)

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email: testData.clientUser.email,
          role: testData.clientUser.role,
        },
      })
    })

    it('should fail to login with invalid credentials', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      }

      await request(testBase.getHttpServer()).post('/auth/login').send(loginDto).expect(401)
    })

    it('should fail to login with missing credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
      }

      await request(testBase.getHttpServer()).post('/auth/login').send(loginDto).expect(400)
    })
  })

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const testData = dataFactory.getTestData()

      // First login to get refresh token
      const loginResponse = await request(testBase.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.clientUser.email,
          password: 'TestPassword123!',
        })
        .expect(200)

      const refreshDto = {
        refreshToken: loginResponse.body.refreshToken,
      }

      const response = await request(testBase.getHttpServer())
        .post('/auth/refresh')
        .send(refreshDto)
        .expect(200)

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    })

    it('should fail to refresh with invalid token', async () => {
      const refreshDto = {
        refreshToken: 'invalid-refresh-token',
      }

      await request(testBase.getHttpServer()).post('/auth/refresh').send(refreshDto).expect(401)
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      await request(testBase.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)
    })

    it('should fail to logout without authentication', async () => {
      await request(testBase.getHttpServer()).post('/auth/logout').expect(401)
    })
  })

  describe('GET /auth/profile', () => {
    it('should get user profile successfully', async () => {
      const testData = dataFactory.getTestData()

      const response = await request(testBase.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: testData.adminUser.id,
        email: testData.adminUser.email,
        role: testData.adminUser.role,
      })
    })

    it('should fail to get profile without authentication', async () => {
      await request(testBase.getHttpServer()).get('/auth/profile').expect(401)
    })

    it('should fail to get profile with invalid token', async () => {
      await request(testBase.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('Authentication Security', () => {
    it('should handle concurrent login attempts', async () => {
      const testData = dataFactory.getTestData()

      const loginDto = {
        email: testData.clientUser.email,
        password: 'TestPassword123!',
      }

      const loginPromises = Array(3)
        .fill(null)
        .map(() => request(testBase.getHttpServer()).post('/auth/login').send(loginDto))

      const results = await Promise.all(loginPromises)

      results.forEach((result) => {
        expect(result.status).toBe(200)
        expect(result.body.accessToken).toBeDefined()
      })
    })

    it('should handle password validation properly', async () => {
      const testData = dataFactory.getTestData()
      const weakPasswordDto = {
        email: 'test@example.com',
        password: '123',
        role: 'CLIENT',
        clientId: testData.client.id,
      }

      await request(testBase.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordDto)
        .expect(400)
    })
  })
})
