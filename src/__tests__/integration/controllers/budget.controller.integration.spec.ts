import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('BudgetController Integration', () => {
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
    it('should properly initialize test data', async () => {
      const testData = dataFactory.getTestData()

      expect(testData).toBeDefined()
      expect(testData.adminUser).toBeDefined()
      expect(testData.clientUser).toBeDefined()
      expect(testData.employeeUser).toBeDefined()
      expect(testData.client).toBeDefined()
      expect(testData.employee).toBeDefined()
      expect(testData.vehicle).toBeDefined()
      expect(testData.services).toBeDefined()
      expect(testData.services.length).toBeGreaterThan(0)
      expect(testData.stockItems).toBeDefined()
      expect(testData.stockItems.length).toBeGreaterThan(0)
    })

    it('should create a budget with service order', async () => {
      const budget = await dataFactory.createBudget()

      expect(budget).toBeDefined()
      expect(budget.id).toBeDefined()
      expect(budget.serviceOrder).toBeDefined()
      expect(budget.serviceOrder.id).toBeDefined()
      // Troubleshooting Guide Section 5: Accept actual structure instead of forcing changes
      expect(budget.serviceOrder.status).toBe('RECEIVED') // Factory creates with RECEIVED status
    })
  })

  describe('POST /budgets', () => {
    it('should create a new budget successfully', async () => {
      const testData = dataFactory.getTestData()
      const serviceOrder = await dataFactory.createServiceOrder()

      const createBudgetDto = {
        serviceOrderId: serviceOrder.id,
        clientId: testData.client.id,
        validityPeriod: 7,
        deliveryMethod: 'EMAIL',
        notes: 'Test budget creation',
      }

      const response = await request(testBase.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createBudgetDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        status: 'GENERATED',
        validityPeriod: 7,
        deliveryMethod: 'EMAIL',
        notes: 'Test budget creation',
        serviceOrderId: createBudgetDto.serviceOrderId,
        clientId: testData.client.id,
      })
    })

    it('should reject budget creation by client user', async () => {
      const testData = dataFactory.getTestData()
      const serviceOrder = await dataFactory.createServiceOrder()

      const createBudgetDto = {
        serviceOrderId: serviceOrder.id,
        clientId: testData.client.id,
        validityPeriod: 7,
      }

      await request(testBase.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(createBudgetDto)
        .expect(403)
    })
  })

  describe('GET /budgets', () => {
    it('should list all budgets with pagination', async () => {
      await dataFactory.createBudget()
      await dataFactory.createBudget()

      const response = await request(testBase.getHttpServer())
        .get('/budgets?page=1&limit=10')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      })
    })

    it('should reject access by client user', async () => {
      await request(testBase.getHttpServer())
        .get('/budgets')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /budgets/search/client', () => {
    it('should search budgets by client name', async () => {
      await dataFactory.createBudget()
      const testData = dataFactory.getTestData()

      const response = await request(testBase.getHttpServer())
        .get(`/budgets/search/client?clientName=${testData.client.name}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0].clientId).toBe(testData.client.id)
    })
  })

  describe('GET /budgets/:id', () => {
    it('should get a specific budget', async () => {
      const budget = await dataFactory.createBudget()

      const response = await request(testBase.getHttpServer())
        .get(`/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        status: budget.status,
        serviceOrderId: budget.serviceOrderId,
        clientId: budget.clientId,
      })
    })

    it('should return 404 for non-existent budget', async () => {
      await request(testBase.getHttpServer())
        .get('/budgets/non-existent-id')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('GET /budgets/:id/with-items', () => {
    it('should get a budget with its items', async () => {
      const budget = await dataFactory.createBudget()

      const response = await request(testBase.getHttpServer())
        .get(`/budgets/${budget.id}/with-items`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        status: budget.status,
        serviceOrderId: budget.serviceOrderId,
        clientId: budget.clientId,
        budgetItems: expect.any(Array),
      })
    })
  })

  describe('POST /budgets/:id/approve', () => {
    it('should approve a budget successfully', async () => {
      const budget = await dataFactory.createBudget()

      // First send the budget
      await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/send`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      const response = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/approve`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        status: 'APPROVED',
        approvalDate: expect.any(String),
      })
    })

    it('should reject approval of non-existent budget', async () => {
      await request(testBase.getHttpServer())
        .post('/budgets/non-existent-id/approve')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('POST /budgets/:id/reject', () => {
    it('should reject a budget successfully', async () => {
      const budget = await dataFactory.createBudget()

      // First send the budget
      await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/send`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      const response = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/reject`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        status: 'REJECTED',
        rejectionDate: expect.any(String),
      })
    })

    it('should reject rejection of non-existent budget', async () => {
      await request(testBase.getHttpServer())
        .post('/budgets/non-existent-id/reject')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('POST /budgets/:id/send', () => {
    it('should send a budget successfully', async () => {
      const budget = await dataFactory.createBudget()

      const response = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/send`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        status: 'SENT',
        sentDate: expect.any(String),
      })
    })

    it('should reject sending of non-existent budget', async () => {
      await request(testBase.getHttpServer())
        .post('/budgets/non-existent-id/send')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('POST /budgets/:id/receive', () => {
    it('should mark a budget as received successfully', async () => {
      const budget = await dataFactory.createBudget()

      // First send the budget
      await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/send`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      const response = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/receive`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        status: 'RECEIVED',
      })
    })

    it('should reject marking non-existent budget as received', async () => {
      await request(testBase.getHttpServer())
        .post('/budgets/non-existent-id/receive')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('GET /budgets/:id/expired', () => {
    it('should check if budget is expired', async () => {
      const budget = await dataFactory.createBudget()

      const response = await request(testBase.getHttpServer())
        .get(`/budgets/${budget.id}/expired`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        expired: expect.any(Boolean),
      })
    })

    it('should return 404 for non-existent budget', async () => {
      await request(testBase.getHttpServer())
        .get('/budgets/non-existent-id/expired')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('PUT /budgets/:id', () => {
    it('should update a budget successfully', async () => {
      const budget = await dataFactory.createBudget()

      const updateDto = {
        validityPeriod: 14,
        notes: 'Updated budget notes',
        deliveryMethod: 'SMS',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: budget.id,
        validityPeriod: 14,
        notes: 'Updated budget notes',
        deliveryMethod: 'SMS',
      })
    })

    it('should reject update of non-existent budget', async () => {
      const updateDto = {
        validityPeriod: 14,
        notes: 'Updated budget notes',
      }

      await request(testBase.getHttpServer())
        .put('/budgets/non-existent-id')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateDto)
        .expect(404)
    })
  })

  describe('DELETE /budgets/:id', () => {
    it('should delete a budget successfully by admin', async () => {
      const budget = await dataFactory.createBudget()

      await request(testBase.getHttpServer())
        .delete(`/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)

      await request(testBase.getHttpServer())
        .get(`/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })

    it('should reject deletion by non-admin user', async () => {
      const budget = await dataFactory.createBudget()

      await request(testBase.getHttpServer())
        .delete(`/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent budget', async () => {
      await request(testBase.getHttpServer())
        .delete('/budgets/non-existent-id')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })
  })

  describe('Complete Business Flow Tests', () => {
    it('should follow the complete budget lifecycle', async () => {
      const budget = await dataFactory.createBudget()

      expect(budget.status).toBe('GENERATED')

      const sentBudget = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/send`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(sentBudget.body.status).toBe('SENT')

      const receivedBudget = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/receive`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(receivedBudget.body.status).toBe('RECEIVED')

      const approvedBudget = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/approve`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(approvedBudget.body.status).toBe('APPROVED')
    })

    it('should handle budget rejection flow', async () => {
      const budget = await dataFactory.createBudget()

      const sentBudget = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/send`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(sentBudget.body.status).toBe('SENT')

      const rejectedBudget = await request(testBase.getHttpServer())
        .post(`/budgets/${budget.id}/reject`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(rejectedBudget.body.status).toBe('REJECTED')
    })
  })

  describe('Authentication and Authorization Tests', () => {
    it('should verify JWT authentication is working', async () => {
      const budget = await dataFactory.createBudget()

      await request(testBase.getHttpServer())
        .get(`/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      await request(testBase.getHttpServer()).get(`/budgets/${budget.id}`).expect(401)
    })

    it('should verify user context is being set', async () => {
      const budget = await dataFactory.createBudget()

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'GET',
        `/budgets/${budget.id}`,
        employeeAuthToken,
      )
      expect(response.status).toBe(200)
      expect(response.body.id).toBe(budget.id)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields when creating budget', async () => {
      const incompleteBudgetData = {
        // missing clientId and items
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'POST',
        '/budgets',
        employeeAuthToken,
        incompleteBudgetData,
      )
      expect(response.status).toBe(400)
    })

    it('should handle invalid UUID format for budget ID', async () => {
      const invalidId = 'not-a-valid-uuid'

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'GET',
        `/budgets/${invalidId}`,
        adminAuthToken,
      )
      expect(response.status).toBe(404)
    })

    it('should handle update of non-existent budget', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'
      const updateData = {
        validityPeriod: 14, // Use a valid field from UpdateBudgetDto
        notes: 'Updated budget notes',
      }

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'PUT',
        `/budgets/${nonExistentId}`,
        adminAuthToken,
        updateData,
      )
      expect(response.status).toBe(404)
    })

    it('should handle approval of non-existent budget', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'POST',
        `/budgets/${nonExistentId}/approve`,
        adminAuthToken,
      )
      expect(response.status).toBe(404)
    })

    it('should handle rejection of non-existent budget', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'POST',
        `/budgets/${nonExistentId}/reject`,
        adminAuthToken,
      )
      expect(response.status).toBe(404)
    })

    it('should handle deletion of non-existent budget', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'

      const response = await testBase.authUtils.makeAuthenticatedRequest(
        'DELETE',
        `/budgets/${nonExistentId}`,
        adminAuthToken,
      )
      expect(response.status).toBe(404)
    })

    it('should handle invalid pagination parameters', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/budgets')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: -1, limit: 0 })
        .expect(400)

      expect(response.body).toHaveProperty('message')
    })
  })
})
