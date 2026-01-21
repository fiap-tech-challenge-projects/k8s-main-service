import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('ServiceController Integration', () => {
  let testBase: IntegrationTestBase
  let dataFactory: IntegrationTestDataFactory
  let adminAuthToken: string
  let employeeAuthToken: string
  let clientAuthToken: string

  beforeAll(async () => {
    testBase = new IntegrationTestBase()
    await testBase.beforeAll()
    dataFactory = new IntegrationTestDataFactory(testBase.prismaService)
  })

  beforeEach(async () => {
    await dataFactory.initializeTestData()
    const testData = dataFactory.getTestData()

    // Generate proper JWT tokens using direct token creation
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
    await testBase.afterEach()
    if (dataFactory) {
      dataFactory.resetTestData()
    }
  })

  describe('Data Factory Verification', () => {
    it('should properly initialize test data with services', async () => {
      const testData = dataFactory.getTestData()

      expect(testData).toBeDefined()
      expect(testData.services).toBeDefined()
      expect(testData.services.length).toBeGreaterThan(0)

      // Verify first service has required properties
      const firstService = testData.services[0]
      expect(firstService.id).toBeDefined()
      expect(firstService.name).toBeDefined()
      expect(firstService.price).toBeDefined()
      expect(firstService.description).toBeDefined()
    })

    it('should verify services exist in database', async () => {
      const testData = dataFactory.getTestData()

      // Verify first service exists in database
      const serviceInDb = await testBase.prismaService.service.findUnique({
        where: { id: testData.services[0].id },
      })
      expect(serviceInDb).toBeDefined()
      expect(serviceInDb?.id).toBe(testData.services[0].id)
      expect(serviceInDb?.name).toBe(testData.services[0].name)
    })
  })

  describe('POST /services', () => {
    it('should create a new service successfully as ADMIN', async () => {
      const createServiceDto = {
        name: 'Engine Diagnostics',
        price: 'R$ 150,00',
        description: 'Complete engine diagnostics and analysis',
        estimatedDuration: '02:30:00',
      }

      const response = await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createServiceDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Engine Diagnostics',
        price: expect.stringMatching(/^R\$\s*150,00$/),
        description: 'Complete engine diagnostics and analysis',
        estimatedDuration: expect.stringMatching(/^02:30:00$/),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })

      // Verify service was created in database
      const serviceInDb = await testBase.prismaService.service.findUnique({
        where: { id: response.body.id },
      })
      expect(serviceInDb).toBeDefined()
      expect(serviceInDb?.name).toBe('Engine Diagnostics')
    })

    it('should create a new service successfully as EMPLOYEE', async () => {
      const uniqueId = Math.random().toString(36).substring(7)
      const createServiceDto = {
        name: `Brake Inspection ${uniqueId}`,
        price: 'R$ 80,00',
        description: 'Comprehensive brake system inspection',
        estimatedDuration: '01:15:00',
      }

      const response = await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createServiceDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: `Brake Inspection ${uniqueId}`,
        price: expect.stringMatching(/^R\$\s*80,00$/),
        description: 'Comprehensive brake system inspection',
        estimatedDuration: expect.stringMatching(/^01:15:00$/),
      })
    })

    it('should reject service creation for CLIENT role', async () => {
      const createServiceDto = {
        name: 'Unauthorized Service',
        price: 'R$ 100,00',
        description: 'This should not be allowed',
        estimatedDuration: '01:00:00',
      }

      await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(createServiceDto)
        .expect(403) // Forbidden
    })

    it('should validate service data and reject invalid input', async () => {
      const invalidServiceDto = {
        name: '', // Invalid: empty name
        price: 'invalid-price', // Invalid: not a valid price format
        description: 'Valid description',
        estimatedDuration: 'invalid-duration', // Invalid: not a valid duration
      }

      const response = await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidServiceDto)
        .expect(400)

      // Debug: log the actual response body
      console.log('Actual response body:', JSON.stringify(response.body, null, 2))

      expect(response.body).toHaveProperty('message')
      // Check what type message actually is
      console.log('Type of message:', typeof response.body.message)
      console.log('Is array:', Array.isArray(response.body.message))

      // Based on the global exception filter, message should be a string
      // and there should be an errors array for detailed validation errors
      if (response.body.errors) {
        expect(Array.isArray(response.body.errors)).toBe(true)
        expect(response.body.errors.length).toBeGreaterThan(0)
      } else {
        expect(typeof response.body.message).toBe('string')
      }
    })

    it('should reject request without authentication', async () => {
      const createServiceDto = {
        name: 'Unauthorized Service',
        price: 'R$ 100,00',
        description: 'This should require auth',
        estimatedDuration: '01:00:00',
      }

      await request(testBase.getHttpServer()).post('/services').send(createServiceDto).expect(401)
    })
  })

  describe('GET /services', () => {
    it('should retrieve all services with pagination as ADMIN', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean),
      })
    })

    it('should retrieve all services with pagination as EMPLOYEE', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/services')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
    })

    it('should reject request from CLIENT role', async () => {
      await request(testBase.getHttpServer())
        .get('/services')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should reject request without authentication', async () => {
      await request(testBase.getHttpServer()).get('/services').expect(401)
    })
  })

  describe('GET /services/:id', () => {
    it('should retrieve a specific service by ID as ADMIN', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      const response = await request(testBase.getHttpServer())
        .get(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: testService.id,
        name: testService.name,
        price: expect.any(String),
        description: expect.any(String),
        estimatedDuration: expect.any(String),
      })
    })

    it('should retrieve a specific service by ID as EMPLOYEE', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      const response = await request(testBase.getHttpServer())
        .get(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testService.id)
    })

    it('should return 404 for non-existent service', async () => {
      const nonExistentId = 'non-existent-id'

      await request(testBase.getHttpServer())
        .get(`/services/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject request from CLIENT role', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      await request(testBase.getHttpServer())
        .get(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /services/search/:name', () => {
    it('should search services by name as ADMIN', async () => {
      const testData = dataFactory.getTestData()
      const searchName = testData.services[0].name.substring(0, 5) // Search with partial name

      const response = await request(testBase.getHttpServer())
        .get(`/services/search/${searchName}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should search services by name as EMPLOYEE', async () => {
      const testData = dataFactory.getTestData()
      const searchName = testData.services[0].name.substring(0, 5)

      const response = await request(testBase.getHttpServer())
        .get(`/services/search/${searchName}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
    })

    it('should return empty results for non-matching search', async () => {
      const nonMatchingName = 'NonExistentServiceName123'

      const response = await request(testBase.getHttpServer())
        .get(`/services/search/${nonMatchingName}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body.data).toHaveLength(0)
    })

    it('should reject request from CLIENT role', async () => {
      await request(testBase.getHttpServer())
        .get('/services/search/test')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('PUT /services/:id', () => {
    it('should update an existing service as ADMIN', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      const updateServiceDto = {
        name: 'Updated Service Name',
        price: 'R$ 200,00',
        description: 'Updated description',
        estimatedDuration: '03:00:00',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateServiceDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: testService.id,
        name: 'Updated Service Name',
        price: expect.stringMatching(/^R\$\s*200,00$/),
        description: 'Updated description',
        estimatedDuration: expect.stringMatching(/^03:00:00$/),
      })

      // Verify update in database
      const updatedServiceInDb = await testBase.prismaService.service.findUnique({
        where: { id: testService.id },
      })
      expect(updatedServiceInDb?.name).toBe('Updated Service Name')
    })

    it('should update an existing service as EMPLOYEE', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      const updateServiceDto = {
        name: 'Employee Updated Service',
        description: 'Employee updated description',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateServiceDto)
        .expect(200)

      expect(response.body.name).toBe('Employee Updated Service')
    })

    it('should return 404 for non-existent service update', async () => {
      const nonExistentId = 'non-existent-id'
      const updateServiceDto = {
        name: 'This should not work',
      }

      await request(testBase.getHttpServer())
        .put(`/services/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateServiceDto)
        .expect(404)
    })

    it('should reject request from CLIENT role', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      const updateServiceDto = {
        name: 'Unauthorized Update',
      }

      await request(testBase.getHttpServer())
        .put(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(updateServiceDto)
        .expect(403)
    })
  })

  describe('DELETE /services/:id', () => {
    it('should delete a service as ADMIN', async () => {
      // First create a service to delete
      const createServiceDto = {
        name: 'Service to Delete',
        price: 'R$ 100,00',
        description: 'This service will be deleted',
        estimatedDuration: '01:00:00',
      }

      const createResponse = await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createServiceDto)
        .expect(201)

      const createdServiceId = createResponse.body.id

      // Now delete the service
      await request(testBase.getHttpServer())
        .delete(`/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)

      // Verify service was deleted from database
      const deletedServiceInDb = await testBase.prismaService.service.findUnique({
        where: { id: createdServiceId },
      })
      expect(deletedServiceInDb).toBeNull()
    })

    it('should return 404 when trying to delete non-existent service', async () => {
      const nonExistentId = 'non-existent-id'

      await request(testBase.getHttpServer())
        .delete(`/services/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject delete request from EMPLOYEE role', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      await request(testBase.getHttpServer())
        .delete(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should reject delete request from CLIENT role', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      await request(testBase.getHttpServer())
        .delete(`/services/${testService.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should reject delete request without authentication', async () => {
      const testData = dataFactory.getTestData()
      const testService = testData.services[0]

      await request(testBase.getHttpServer()).delete(`/services/${testService.id}`).expect(401)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed request data gracefully', async () => {
      const malformedData = {
        invalidField: 'This should be rejected',
      }

      const response = await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(malformedData)
        .expect(400)

      expect(response.body).toHaveProperty('message')
    })

    it('should handle invalid UUID format for service ID', async () => {
      const invalidId = 'not-a-valid-uuid'

      await request(testBase.getHttpServer())
        .get(`/services/${invalidId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should handle database errors gracefully when creating service', async () => {
      // Test with invalid price format to trigger validation error
      const serviceData = {
        name: 'Test Service With Invalid Price',
        description: 'Service with invalid price format',
        price: 'invalid-price-format', // Invalid price format to trigger 400 error
        estimatedDuration: '01:30:00',
      }

      await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(serviceData)
        .expect(400)
    })

    it('should handle database errors gracefully when searching services', async () => {
      // Test search with special characters that might cause issues
      const problematicSearchTerm = 'special%_chars'

      const response = await request(testBase.getHttpServer())
        .get(`/services/search/${encodeURIComponent(problematicSearchTerm)}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta') // The actual property name from pagination
    })

    it('should handle database errors gracefully when getting services list', async () => {
      // Test with invalid pagination parameters to trigger validation
      await request(testBase.getHttpServer())
        .get('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: -1, limit: 0 })
        .expect(400)
    })

    it('should handle update of non-existent service gracefully', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'
      const updateData = {
        name: 'Updated Service',
        description: 'Updated description',
        price: 'R$200.00', // Correct string format
        estimatedDuration: '02:00:00', // Correct field name and format
      }

      await request(testBase.getHttpServer())
        .put(`/services/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(404)
    })

    it('should handle service creation with invalid price', async () => {
      const invalidServiceData = {
        name: 'Invalid Price Service',
        description: 'This service has invalid price',
        price: -50.0, // negative price
        estimatedDurationInMinutes: 60,
      }

      await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidServiceData)
        .expect(400)
    })

    it('should handle service creation with invalid duration', async () => {
      const invalidServiceData = {
        name: 'Invalid Duration Service',
        description: 'This service has invalid duration',
        price: 100.0,
        estimatedDurationInMinutes: -30, // negative duration
      }

      await request(testBase.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidServiceData)
        .expect(400)
    })

    it('should handle empty search term gracefully', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/services/search/')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: 1, limit: 10 })
        .expect(404) // Empty search term should return 404

      expect(response.body).toHaveProperty('message')
    })

    it('should handle extremely large search term', async () => {
      const largeSearchTerm = 'a'.repeat(1000) // Very long search term

      const response = await request(testBase.getHttpServer())
        .get(`/services/search/${encodeURIComponent(largeSearchTerm)}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toEqual([]) // Should return empty array
    })
  })
})
