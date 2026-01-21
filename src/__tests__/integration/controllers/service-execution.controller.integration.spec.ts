import { ServiceExecutionStatus } from '@prisma/client'
import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('ServiceExecutionController Integration', () => {
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
    })
  })

  describe('GET /service-executions', () => {
    it('should get all service executions successfully as employee', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .get('/service-executions')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: serviceExecution.id,
            status: serviceExecution.status,
          }),
        ]),
        meta: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        },
      })
    })

    it('should get all service executions successfully as admin', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .get('/service-executions')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.meta).toBeDefined()
    })

    it('should fail to get service executions as client', async () => {
      await request(testBase.getHttpServer())
        .get('/service-executions')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should fail to get service executions without authentication', async () => {
      await request(testBase.getHttpServer()).get('/service-executions').expect(401)
    })

    it('should support pagination parameters', async () => {
      const serviceOrder1 = await dataFactory.createServiceOrder()
      const serviceOrder2 = await dataFactory.createServiceOrder()
      await dataFactory.createServiceExecution(serviceOrder1.id)
      await dataFactory.createServiceExecution(serviceOrder2.id)

      const response = await request(testBase.getHttpServer())
        .get('/service-executions?page=1&limit=1')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body.meta.page).toBe(1)
      expect(response.body.meta.limit).toBe(1)
      expect(response.body.data.length).toBeLessThanOrEqual(1)
    })
  })

  describe('GET /service-executions/service-order/:serviceOrderId', () => {
    it('should get service executions by service order ID as employee', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .get(`/service-executions/service-order/${serviceOrder.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        data: [
          {
            id: serviceExecution.id,
            serviceOrderId: serviceOrder.id,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })
    })

    it('should return empty results for service order with no executions', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()

      const response = await request(testBase.getHttpServer())
        .get(`/service-executions/service-order/${serviceOrder.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      })
    })

    it('should fail to get service executions by service order as client', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()

      await request(testBase.getHttpServer())
        .get(`/service-executions/service-order/${serviceOrder.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /service-executions/mechanic/:mechanicId', () => {
    it('should get service executions by mechanic ID as employee', async () => {
      const testData = dataFactory.getTestData()
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .get(`/service-executions/mechanic/${testData.employee.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: serviceExecution.id,
            mechanicId: testData.employee.id,
          }),
        ]),
      )
    })
  })

  describe('GET /service-executions/:id', () => {
    it('should get service execution by ID as employee', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .get(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: serviceExecution.id,
        status: serviceExecution.status,
      })
    })

    it('should get service execution by ID as admin', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .get(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body.id).toBe(serviceExecution.id)
    })

    it('should fail to get service execution as client', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      await request(testBase.getHttpServer())
        .get(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent service execution', async () => {
      await request(testBase.getHttpServer())
        .get('/service-executions/non-existent-id')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('PUT /service-executions/:id/start', () => {
    it('should start service execution as employee', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/start`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: serviceExecution.id,
        status: ServiceExecutionStatus.IN_PROGRESS,
      })
    })

    it('should start service execution as admin', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      const response = await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/start`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body.status).toBe(ServiceExecutionStatus.IN_PROGRESS)
    })

    it('should fail to start service execution as client', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/start`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent service execution', async () => {
      await request(testBase.getHttpServer())
        .put('/service-executions/non-existent-id/start')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })
  })

  describe('PUT /service-executions/:id/complete', () => {
    it('should complete service execution as employee', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id, {
        status: ServiceExecutionStatus.IN_PROGRESS,
      })

      const completionData = {
        actualHours: 5,
        completionNotes: 'Service completed successfully',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/complete`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(completionData)
        .expect(200)

      expect(response.body).toMatchObject({
        id: serviceExecution.id,
        status: ServiceExecutionStatus.COMPLETED,
      })
    })

    it('should complete service execution as admin', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id, {
        status: ServiceExecutionStatus.IN_PROGRESS,
      })

      const completionData = {
        actualHours: 3,
        completionNotes: 'Admin completed service',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/complete`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(completionData)
        .expect(200)

      expect(response.body.status).toBe(ServiceExecutionStatus.COMPLETED)
    })

    it('should fail to complete service execution as client', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id, {
        status: ServiceExecutionStatus.IN_PROGRESS,
      })

      const completionData = {
        actualHours: 4,
      }

      await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/complete`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(completionData)
        .expect(403)
    })

    it('should return 404 for non-existent service execution', async () => {
      const completionData = {
        actualHours: 4,
      }

      await request(testBase.getHttpServer())
        .put('/service-executions/non-existent-id/complete')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(completionData)
        .expect(404)
    })
  })

  describe('DELETE /service-executions/:id', () => {
    it('should delete service execution as admin', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      await request(testBase.getHttpServer())
        .delete(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)

      await request(testBase.getHttpServer())
        .get(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should fail to delete service execution as employee', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      await request(testBase.getHttpServer())
        .delete(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should fail to delete service execution as client', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      await request(testBase.getHttpServer())
        .delete(`/service-executions/${serviceExecution.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent service execution', async () => {
      await request(testBase.getHttpServer())
        .delete('/service-executions/non-existent-id')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })
  })

  describe('Business Logic Validation', () => {
    it('should create service execution with correct initial status', async () => {
      const testData = dataFactory.getTestData()
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      expect(serviceExecution).toMatchObject({
        status: ServiceExecutionStatus.ASSIGNED,
        mechanicId: testData.employee.id,
      })
    })

    it('should allow status transitions from ASSIGNED to IN_PROGRESS to COMPLETED', async () => {
      const serviceOrder = await dataFactory.createServiceOrder()
      const serviceExecution = await dataFactory.createServiceExecution(serviceOrder.id)

      // Start execution (ASSIGNED -> IN_PROGRESS)
      const startResponse = await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/start`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(startResponse.body.status).toBe(ServiceExecutionStatus.IN_PROGRESS)

      // Complete execution (IN_PROGRESS -> COMPLETED)
      const completeResponse = await request(testBase.getHttpServer())
        .put(`/service-executions/${serviceExecution.id}/complete`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send({ actualHours: 5 })
        .expect(200)

      expect(completeResponse.body.status).toBe(ServiceExecutionStatus.COMPLETED)
    })
  })
})
