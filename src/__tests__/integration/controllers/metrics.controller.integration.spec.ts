import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('MetricsController Integration', () => {
  let testBase: IntegrationTestBase
  let dataFactory: IntegrationTestDataFactory
  let adminAuthToken: string
  let employeeAuthToken: string
  let clientAuthToken: string

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
    employeeAuthToken = tokens.employeeToken
    clientAuthToken = tokens.clientToken
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

  afterAll(async () => {
    await testBase.afterAll()
  })

  beforeEach(async () => {
    await dataFactory.cleanupTestData()
  })

  describe('GET /metrics', () => {
    it('should get raw metrics as admin', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(typeof response.text).toBe('string')
    })

    it('should fail to get metrics as employee', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should fail to get metrics as client', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should fail to get metrics without authentication', async () => {
      await request(testBase.getHttpServer()).get('/metrics').expect(401)
    })
  })

  describe('GET /metrics/summary', () => {
    it('should get metrics summary as admin', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/metrics/summary')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(typeof response.body).toBe('object')
      expect(response.body).not.toBeNull()
    })

    it('should fail to get metrics summary as employee', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics/summary')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should fail to get metrics summary as client', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics/summary')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should fail to get metrics summary without authentication', async () => {
      await request(testBase.getHttpServer()).get('/metrics/summary').expect(401)
    })
  })

  describe('GET /metrics/mean-times', () => {
    it('should get mean execution times as admin', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/metrics/mean-times')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(typeof response.body).toBe('object')
      expect(response.body).not.toBeNull()
    })

    it('should fail to get mean execution times as employee', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics/mean-times')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should fail to get mean execution times as client', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics/mean-times')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should fail to get mean execution times without authentication', async () => {
      await request(testBase.getHttpServer()).get('/metrics/mean-times').expect(401)
    })
  })

  describe('GET /metrics/status', () => {
    it('should get metrics service status as admin', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/metrics/status')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        enabled: expect.any(Boolean),
        timestamp: expect.any(String),
      })

      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
    })

    it('should fail to get metrics status as employee', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics/status')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should fail to get metrics status as client', async () => {
      await request(testBase.getHttpServer())
        .get('/metrics/status')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should fail to get metrics status without authentication', async () => {
      await request(testBase.getHttpServer()).get('/metrics/status').expect(401)
    })
  })

  describe('DELETE /metrics', () => {
    it('should reset metrics as admin', async () => {
      const response = await request(testBase.getHttpServer())
        .delete('/metrics')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        message: 'Metrics reset successfully',
      })
    })

    it('should fail to reset metrics as employee', async () => {
      await request(testBase.getHttpServer())
        .delete('/metrics')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should fail to reset metrics as client', async () => {
      await request(testBase.getHttpServer())
        .delete('/metrics')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should fail to reset metrics without authentication', async () => {
      await request(testBase.getHttpServer()).delete('/metrics').expect(401)
    })
  })

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/metrics' },
        { method: 'get', path: '/metrics/summary' },
        { method: 'get', path: '/metrics/mean-times' },
        { method: 'get', path: '/metrics/status' },
        { method: 'delete', path: '/metrics' },
      ]

      for (const endpoint of endpoints) {
        await request(testBase.getHttpServer())[endpoint.method](endpoint.path).expect(401)
      }
    })

    it('should enforce admin-only access control', async () => {
      const endpoints = [
        { method: 'get', path: '/metrics' },
        { method: 'get', path: '/metrics/summary' },
        { method: 'get', path: '/metrics/mean-times' },
        { method: 'get', path: '/metrics/status' },
        { method: 'delete', path: '/metrics' },
      ]

      const nonAdminTokens = [employeeAuthToken, clientAuthToken]

      for (const token of nonAdminTokens) {
        for (const endpoint of endpoints) {
          await request(testBase.getHttpServer())
            [endpoint.method](endpoint.path)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
        }
      }
    })

    it('should allow admin to access all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/metrics' },
        { method: 'get', path: '/metrics/summary' },
        { method: 'get', path: '/metrics/mean-times' },
        { method: 'get', path: '/metrics/status' },
        { method: 'delete', path: '/metrics' },
      ]

      for (const endpoint of endpoints) {
        await request(testBase.getHttpServer())
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .expect(200)
      }
    })
  })

  describe('Metrics Service Integration', () => {
    it('should verify metrics service is responding', async () => {
      const statusResponse = await request(testBase.getHttpServer())
        .get('/metrics/status')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(statusResponse.body.enabled).toBeDefined()
    })

    it('should verify metrics can be reset and retrieved', async () => {
      await request(testBase.getHttpServer())
        .delete('/metrics')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      const metricsResponse = await request(testBase.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(typeof metricsResponse.text).toBe('string')
    })

    it('should verify all metric endpoints return proper data types', async () => {
      // Sequential requests with retry logic to avoid ECONNRESET issues
      const endpoints = [
        { path: '/metrics', expectedType: 'string', property: 'text' },
        { path: '/metrics/summary', expectedType: 'object', property: 'body' },
        { path: '/metrics/mean-times', expectedType: 'object', property: 'body' },
        { path: '/metrics/status', expectedType: 'object', property: 'body' },
      ]

      for (const endpoint of endpoints) {
        let attempts = 0
        const maxAttempts = 3
        let lastError: any

        while (attempts < maxAttempts) {
          try {
            const response = await request(testBase.getHttpServer())
              .get(endpoint.path)
              .set('Authorization', `Bearer ${adminAuthToken}`)
              .timeout(10000) // 10 second timeout
              .expect(200)

            expect(typeof response[endpoint.property]).toBe(endpoint.expectedType)
            break // Success, exit retry loop
          } catch (error) {
            attempts++
            lastError = error

            if (attempts < maxAttempts) {
              // Wait before retry with exponential backoff
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
            } else {
              throw new Error(
                `Metrics endpoint ${endpoint.path} failed after ${maxAttempts} attempts. Last error: ${lastError.message}`,
              )
            }
          }
        }

        // Small delay between endpoints to avoid connection flooding
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    })
  })
})
