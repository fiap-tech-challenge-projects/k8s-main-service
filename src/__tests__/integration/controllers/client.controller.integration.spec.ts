import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('ClientController Integration', () => {
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
    it('should properly initialize test data', async () => {
      const testData = dataFactory.getTestData()

      expect(testData).toBeDefined()
      expect(testData.adminUser).toBeDefined()
      expect(testData.clientUser).toBeDefined()
      expect(testData.employeeUser).toBeDefined()
      expect(testData.client).toBeDefined()
      expect(testData.employee).toBeDefined()
    })

    it('should verify test data exists in database', async () => {
      const testData = dataFactory.getTestData()

      // Verify client exists in database
      const clientInDb = await testBase.prismaService.client.findUnique({
        where: { id: testData.client.id },
      })
      expect(clientInDb).toBeDefined()
      expect(clientInDb?.id).toBe(testData.client.id)
    })
  })

  describe('GET /clients', () => {
    it('should return all clients for admin user', async () => {
      await dataFactory.initializeTestData()

      const response = await request(testBase.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('should return paginated results', async () => {
      await dataFactory.initializeTestData()

      const response = await request(testBase.getHttpServer())
        .get('/clients?page=1&limit=5')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('meta')
      expect(response.body.meta).toHaveProperty('page', 1)
      expect(response.body.meta).toHaveProperty('limit', 5)
    })

    it('should reject client access to main controller', async () => {
      const testData = dataFactory.getTestData()

      // Set user context to client user
      testBase.mockUserContextService.setUserContext({
        userId: testData.clientUser.id,
        role: 'CLIENT',
        email: testData.clientUser.email,
        clientId: testData.client.id,
      })

      await request(testBase.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).get('/clients').expect(401)
    })

    it('should allow employee to see all clients', async () => {
      await dataFactory.initializeTestData()

      const response = await request(testBase.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /clients/search/name/:name', () => {
    it('should search clients by name for admin user', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()
      const searchName = testData.client.name.split(' ')[0] // Get first name

      const response = await request(testBase.getHttpServer())
        .get(`/clients/search/${searchName}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('should return empty results for non-existent name', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/clients/search/NonExistentName')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBe(0)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).get('/clients/search/test').expect(401)
    })
  })

  describe('GET /clients/cpf-cnpj/:cpfCnpj', () => {
    it('should get client by CPF/CNPJ for admin user', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const response = await request(testBase.getHttpServer())
        .get(`/clients/cpf-cnpj/${testData.client.cpfCnpj}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testData.client.id)
      expect(response.body).toHaveProperty('cpfCnpj') // Just check it exists, format will be different
      expect(response.body).toHaveProperty('name', testData.client.name)
    })

    it('should return 404 for non-existent CPF/CNPJ', async () => {
      await request(testBase.getHttpServer())
        .get('/clients/cpf-cnpj/12345678909') // Valid CPF format but non-existent
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).get('/clients/cpf-cnpj/12345678909').expect(401)
    })
  })

  describe('GET /clients/email/:email', () => {
    it('should get client by email for admin user', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const response = await request(testBase.getHttpServer())
        .get(`/clients/email/${testData.client.email}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testData.client.id)
      expect(response.body).toHaveProperty('email', testData.client.email)
      expect(response.body).toHaveProperty('name', testData.client.name)
    })

    it('should return 404 for non-existent email', async () => {
      await request(testBase.getHttpServer())
        .get('/clients/email/nonexistent@example.com')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).get('/clients/email/test@example.com').expect(401)
    })
  })

  describe('GET /clients/check-email/:email', () => {
    it('should check email availability for admin user', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      // Check existing email
      const existingResponse = await request(testBase.getHttpServer())
        .get(`/clients/check/email/${testData.client.email}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(existingResponse.body).toHaveProperty('available', false)

      // Check non-existing email
      const newEmail = 'newemail@example.com'
      const newResponse = await request(testBase.getHttpServer())
        .get(`/clients/check/email/${newEmail}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(newResponse.body).toHaveProperty('available', true)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer())
        .get('/clients/check/email/test@example.com')
        .expect(401)
    })
  })

  describe('GET /clients/check-cpf-cnpj/:cpfCnpj', () => {
    it('should check CPF/CNPJ availability for admin user', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      // Check existing CPF/CNPJ
      const existingResponse = await request(testBase.getHttpServer())
        .get(`/clients/check/cpf-cnpj/${testData.client.cpfCnpj}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(existingResponse.body).toHaveProperty('available', false)

      // Check non-existing CPF/CNPJ
      const newCpfCnpj = '12345678909' // Valid CPF format but non-existent
      const newResponse = await request(testBase.getHttpServer())
        .get(`/clients/check/cpf-cnpj/${newCpfCnpj}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(newResponse.body).toHaveProperty('available', true)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).get('/clients/check/cpf-cnpj/12345678901').expect(401)
    })
  })

  describe('GET /clients/:id', () => {
    it('should get client by ID for admin user', async () => {
      await dataFactory.initializeTestData()
      const testData = dataFactory.getTestData()

      const response = await request(testBase.getHttpServer())
        .get(`/clients/${testData.client.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', testData.client.id)
      expect(response.body).toHaveProperty('email', testData.client.email)
      expect(response.body).toHaveProperty('name', testData.client.name)
      expect(response.body).toHaveProperty('cpfCnpj') // Just check it exists, format will be different
    })

    it('should reject client access to get client by ID', async () => {
      const testData = dataFactory.getTestData()

      // Set user context to client user
      testBase.mockUserContextService.setUserContext({
        userId: testData.clientUser.id,
        role: 'CLIENT',
        email: testData.clientUser.email,
        clientId: testData.client.id,
      })

      await request(testBase.getHttpServer())
        .get(`/clients/${testData.client.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent ID', async () => {
      await request(testBase.getHttpServer())
        .get('/clients/non-existent-id')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).get('/clients/test-id').expect(401)
    })
  })

  describe('POST /clients', () => {
    it('should create a new client for admin user', async () => {
      const newClientData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '12345678909', // Valid CPF
        phone: '+55 11 99999-8888',
        address: '123 Main St, São Paulo, SP',
      }

      const response = await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(newClientData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', newClientData.name)
      expect(response.body).toHaveProperty('email', newClientData.email)
      expect(response.body).toHaveProperty('cpfCnpj')
      expect(response.body).toHaveProperty('phone')
      expect(response.body).toHaveProperty('address', newClientData.address)
    })

    it('should create client with minimal data', async () => {
      const uniqueId = `${Math.random().toString(36).substring(2, 8)}-${Date.now()}`
      const minimalClientData = {
        name: 'Jane Doe',
        email: `jane.doe.${uniqueId}@example.com`,
        cpfCnpj: '12345678909', // Valid CPF
      }

      const response = await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(minimalClientData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', minimalClientData.name)
      expect(response.body).toHaveProperty('email', minimalClientData.email)
      expect(response.body).toHaveProperty('cpfCnpj')
    })

    it('should reject duplicate email', async () => {
      const testData = dataFactory.getTestData()
      const duplicateClientData = {
        name: 'Duplicate Client',
        email: testData.client.email, // Use existing email
        cpfCnpj: '11144477735', // Valid CPF
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(duplicateClientData)
        .expect(409)
    })

    it('should reject duplicate CPF/CNPJ', async () => {
      const testData = dataFactory.getTestData()
      const duplicateClientData = {
        name: 'Duplicate Client',
        email: 'duplicate@example.com',
        cpfCnpj: testData.client.cpfCnpj, // Use existing CPF/CNPJ
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(duplicateClientData)
        .expect(409)
    })

    it('should reject invalid data', async () => {
      const invalidClientData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: wrong email format
        cpfCnpj: '123', // Invalid: wrong CPF/CNPJ format
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidClientData)
        .expect(400)
    })

    it('should reject unauthorized access', async () => {
      const newClientData = {
        name: 'Test Client',
        email: 'test@example.com',
        cpfCnpj: '12345678909', // Valid CPF
      }

      await request(testBase.getHttpServer()).post('/clients').send(newClientData).expect(401)
    })

    it('should reject client access to create clients', async () => {
      const newClientData = {
        name: 'Test Client',
        email: 'test@example.com',
        cpfCnpj: '12345678909', // Valid CPF
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(newClientData)
        .expect(403)
    })
  })

  describe('PUT /clients/:id', () => {
    it('should update client for admin user', async () => {
      const testData = dataFactory.getTestData()
      const updateData = {
        name: 'Updated Client Name',
        address: '456 Updated St, São Paulo, SP',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/clients/${testData.client.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('name', updateData.name)
      expect(response.body).toHaveProperty('address', updateData.address)
      expect(response.body).toHaveProperty('id', testData.client.id)
    })

    it('should reject client access to update client', async () => {
      const testData = dataFactory.getTestData()

      // Set user context to client user
      testBase.mockUserContextService.setUserContext({
        userId: testData.clientUser.id,
        role: 'CLIENT',
        email: testData.clientUser.email,
        clientId: testData.client.id,
      })

      const updateData = {
        name: 'Updated Client Name',
        address: '456 Updated St, São Paulo, SP',
      }

      await request(testBase.getHttpServer())
        .put(`/clients/${testData.client.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(updateData)
        .expect(403)
    })

    it('should update client email and validate uniqueness', async () => {
      const testData = dataFactory.getTestData()
      const newEmail = 'newemail@example.com'

      // First, create another client with the new email
      const anotherClient = await testBase.prismaService.client.create({
        data: {
          name: 'Another Client',
          email: newEmail,
          cpfCnpj: '12345678909', // Valid CPF
        },
      })

      // Try to update first client with the same email
      const updateData = { email: newEmail }

      await request(testBase.getHttpServer())
        .put(`/clients/${testData.client.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(409)

      // Clean up
      await testBase.prismaService.client.delete({
        where: { id: anotherClient.id },
      })
    })

    it('should return 404 for non-existent client', async () => {
      const updateData = { name: 'Updated Name' }

      await request(testBase.getHttpServer())
        .put('/clients/non-existent-id')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(404)
    })

    it('should reject unauthorized access', async () => {
      const updateData = { name: 'Updated Name' }

      await request(testBase.getHttpServer()).put('/clients/test-id').send(updateData).expect(401)
    })
  })

  describe('DELETE /clients/:id', () => {
    it('should delete client for admin user', async () => {
      const testData = dataFactory.getTestData()

      await request(testBase.getHttpServer())
        .delete(`/clients/${testData.client.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)

      // Verify client was deleted
      const deletedClient = await testBase.prismaService.client.findUnique({
        where: { id: testData.client.id },
      })
      expect(deletedClient).toBeNull()
    })

    it('should return 404 for non-existent client', async () => {
      await request(testBase.getHttpServer())
        .delete('/clients/non-existent-id')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject unauthorized access', async () => {
      await request(testBase.getHttpServer()).delete('/clients/test-id').expect(401)
    })
  })

  describe('Complete Client Lifecycle', () => {
    it('should handle complete client lifecycle: create -> update -> delete', async () => {
      // Step 1: Create client
      const uniqueId = `${Math.random().toString(36).substring(2, 8)}-${Date.now()}`
      const newClientData = {
        name: 'Lifecycle Test Client',
        email: `lifecycle.test.${uniqueId}@example.com`,
        cpfCnpj: '12345678909', // Valid CPF
        phone: '+55 11 99999-8888',
        address: '123 Lifecycle St, São Paulo, SP',
      }

      const createResponse = await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(newClientData)
        .expect(201)

      const clientId = createResponse.body.id
      expect(createResponse.body).toHaveProperty('name', newClientData.name)
      expect(createResponse.body).toHaveProperty('email', newClientData.email)

      // Step 2: Update client
      const updateData = {
        name: 'Updated Lifecycle Client',
        address: '456 Updated Lifecycle St, São Paulo, SP',
      }

      const updateResponse = await request(testBase.getHttpServer())
        .put(`/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(200)

      expect(updateResponse.body).toHaveProperty('name', updateData.name)
      expect(updateResponse.body).toHaveProperty('address', updateData.address)

      // Step 3: Delete client
      await request(testBase.getHttpServer())
        .delete(`/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)

      // Verify client was deleted
      const deletedClient = await testBase.prismaService.client.findUnique({
        where: { id: clientId },
      })
      expect(deletedClient).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully when creating client', async () => {
      // Test with duplicate email to trigger database constraint error
      const testData = dataFactory.getTestData()

      const clientData = {
        name: 'Duplicate Email Client',
        email: testData.client.email, // duplicate email
        cpfCnpj: '98765432100', // different CPF but valid format
        phone: '+55 11 98765-4321',
        address: '123 Test St',
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(clientData)
        .expect(409)
    })

    it('should handle invalid email format', async () => {
      const invalidClientData = {
        name: 'Invalid Email Client',
        email: 'invalid-email-format',
        cpfCnpj: '98765432100', // valid CPF format
        phone: '+55 11 98765-4321',
        address: '123 Test St',
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidClientData)
        .expect(400)
    })

    it('should handle missing required fields', async () => {
      const incompleteClientData = {
        name: 'Incomplete Client',
        // missing email, phone, document, address
      }

      await request(testBase.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(incompleteClientData)
        .expect(400)
    })

    it('should handle invalid UUID format for client ID', async () => {
      const invalidId = 'not-a-valid-uuid'

      await request(testBase.getHttpServer())
        .get(`/clients/${invalidId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should handle update of non-existent client', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'
      const updateData = {
        name: 'Updated Client',
        address: 'Updated address',
      }

      await request(testBase.getHttpServer())
        .put(`/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(404)
    })

    it('should handle deletion of non-existent client', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012'

      await request(testBase.getHttpServer())
        .delete(`/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should handle invalid pagination parameters', async () => {
      await request(testBase.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: -1, limit: 0 })
        .expect(400)
    })

    it('should handle search with empty term', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/clients/search/')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty('message')
    })
  })
})
