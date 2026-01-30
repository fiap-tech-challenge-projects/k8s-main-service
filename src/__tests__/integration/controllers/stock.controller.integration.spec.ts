import * as request from 'supertest'

import { IntegrationTestDataFactory } from '../factories'
import { IntegrationTestBase } from '../integration-test-base'

describe('StockController Integration', () => {
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

    // Create tokens directly instead of using login to bypass authentication issues
    adminAuthToken = testBase.authUtils.createTestToken({
      id: testData.adminUser.id,
      email: testData.adminUser.email,
      role: testData.adminUser.role,
    })

    employeeAuthToken = testBase.authUtils.createTestToken({
      id: testData.employeeUser.id,
      email: testData.employeeUser.email,
      role: testData.employeeUser.role,
      employeeId: testData.employeeUser.employeeId,
    })

    clientAuthToken = testBase.authUtils.createTestToken({
      id: testData.clientUser.id,
      email: testData.clientUser.email,
      role: testData.clientUser.role,
      clientId: testData.clientUser.clientId,
    })
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
      expect(testData.stockItems).toBeDefined()
      expect(testData.stockItems.length).toBeGreaterThan(0)
    })

    it('should verify stock test data exists in database', async () => {
      const testData = dataFactory.getTestData()

      expect(testData.stockItems.length).toBeGreaterThan(0)

      const stockItemInDb = await testBase.prismaService.stockItem.findUnique({
        where: { id: testData.stockItems[0].id },
      })
      expect(stockItemInDb).toBeDefined()
      expect(stockItemInDb?.id).toBe(testData.stockItems[0].id)
    })
  })

  describe('POST /stocks', () => {
    it('should create a new stock item successfully as Employee', async () => {
      const createStockItemDto = {
        name: 'Test Oil Filter',
        sku: 'TOF-001',
        currentStock: 50,
        minStockLevel: 10,
        unitCost: '25.50',
        unitSalePrice: '50.00',
        description: 'High quality oil filter',
        supplier: 'Bosch',
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createStockItemDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Test Oil Filter',
        sku: 'TOF-001',
        currentStock: 50,
        minStockLevel: 10,
        unitCost: expect.stringMatching(/25,50/),
        unitSalePrice: expect.stringMatching(/50,00/),
        description: 'High quality oil filter',
        supplier: 'Bosch',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should create a new stock item successfully as Admin', async () => {
      const createStockItemDto = {
        name: 'Admin Test Item',
        sku: 'ATI-001',
        currentStock: 25,
        minStockLevel: 5,
        unitCost: '15.00',
        unitSalePrice: '30.00',
        description: 'Test item created by admin',
        supplier: 'Test Supplier',
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createStockItemDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Admin Test Item',
        sku: 'ATI-001',
        currentStock: 25,
        minStockLevel: 5,
        unitCost: expect.stringMatching(/15,00/),
        unitSalePrice: expect.stringMatching(/30,00/),
        description: 'Test item created by admin',
        supplier: 'Test Supplier',
      })
    })

    it('should reject creation with invalid price margin', async () => {
      const createStockItemDto = {
        name: 'Invalid Item',
        sku: 'INV-001',
        currentStock: 10,
        minStockLevel: 2,
        unitCost: '100.00',
        unitSalePrice: '50.00', // Sale price lower than cost
        description: 'This should fail',
        supplier: 'Test Supplier',
      }

      await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createStockItemDto)
        .expect(400)
    })

    it('should reject creation with duplicate SKU', async () => {
      const testData = dataFactory.getTestData()
      const existingSku = testData.stockItems[0].sku

      const createStockItemDto = {
        name: 'Duplicate SKU Item',
        sku: existingSku, // Using existing SKU
        currentStock: 10,
        minStockLevel: 2,
        unitCost: '10.00',
        unitSalePrice: '20.00',
        description: 'This should fail',
        supplier: 'Test Supplier',
      }

      await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createStockItemDto)
        .expect(409)
    })

    it('should reject unauthorized access from Client', async () => {
      const createStockItemDto = {
        name: 'Unauthorized Item',
        sku: 'UNA-001',
        currentStock: 10,
        minStockLevel: 2,
        unitCost: '10.00',
        unitSalePrice: '20.00',
      }

      await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(createStockItemDto)
        .expect(403)
    })

    it('should reject unauthenticated requests', async () => {
      const createStockItemDto = {
        name: 'Unauthenticated Item',
        sku: 'UNS-001',
        currentStock: 10,
        minStockLevel: 2,
        unitCost: '10.00',
        unitSalePrice: '20.00',
      }

      await request(testBase.getHttpServer()).post('/stocks').send(createStockItemDto).expect(401)
    })
  })

  describe('GET /stocks', () => {
    it('should get all stock items with pagination as Employee', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        meta: {
          total: expect.any(Number),
          page: 1,
          limit: 10,
        },
      })

      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        sku: expect.any(String),
        currentStock: expect.any(Number),
        minStockLevel: expect.any(Number),
        unitCost: expect.any(String),
        unitSalePrice: expect.any(String),
      })
    })

    it('should get all stock items as Admin', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/stocks')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        meta: {
          total: expect.any(Number),
        },
      })
    })

    it('should reject unauthorized access from Client', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /stocks/:id', () => {
    it('should get stock item by ID as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: stockItem.id,
        name: expect.any(String),
        sku: expect.any(String),
        currentStock: expect.any(Number),
        minStockLevel: expect.any(Number),
        unitCost: expect.any(String),
        unitSalePrice: expect.any(String),
      })
    })

    it('should get stock item by ID as Admin', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200)

      expect(response.body.id).toBe(stockItem.id)
    })

    it('should return 404 for non-existent stock item', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      await request(testBase.getHttpServer())
        .get(`/stocks/${nonExistentId}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      await request(testBase.getHttpServer())
        .get(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /stocks/search/sku/:sku', () => {
    it('should get stock item by SKU as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/search/sku/${stockItem.sku}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: stockItem.id,
        sku: stockItem.sku,
        name: expect.any(String),
      })
    })

    it('should return 404 for non-existent SKU', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks/search/sku/NON-EXISTENT-SKU')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(404)
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      await request(testBase.getHttpServer())
        .get(`/stocks/search/sku/${stockItem.sku}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /stocks/search/name/:name', () => {
    it('should search stock items by name as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]
      const searchTerm = stockItem.name.substring(0, 5) // First 5 characters

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/search/name/${searchTerm}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        meta: {
          total: expect.any(Number),
        },
      })

      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining(searchTerm),
      })
    })

    it('should reject unauthorized access from Client', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks/search/name/Test')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /stocks/search/supplier/:supplier', () => {
    it('should search stock items by supplier as Employee', async () => {
      const testData = dataFactory.getTestData()

      // Find a stock item with a supplier
      const stockItemWithSupplier = testData.stockItems.find((item) => item.supplier)
      if (!stockItemWithSupplier) {
        // Create one if none exists
        const newStockItem = await testBase.prismaService.stockItem.create({
          data: {
            name: 'Test Item with Supplier',
            sku: 'TWS-001',
            currentStock: 10,
            minStockLevel: 2,
            unitCost: 10.0,
            unitSalePrice: 20.0,
            supplier: 'Test Supplier Corp',
          },
        })

        const response = await request(testBase.getHttpServer())
          .get(`/stocks/search/supplier/${newStockItem.supplier}`)
          .set('Authorization', `Bearer ${employeeAuthToken}`)
          .expect(200)

        expect(response.body).toMatchObject({
          data: expect.any(Array),
          meta: {
            total: expect.any(Number),
          },
        })
      } else {
        const response = await request(testBase.getHttpServer())
          .get(`/stocks/search/supplier/${stockItemWithSupplier.supplier}`)
          .set('Authorization', `Bearer ${employeeAuthToken}`)
          .expect(200)

        expect(response.body).toMatchObject({
          data: expect.any(Array),
          meta: {
            total: expect.any(Number),
          },
        })
      }
    })

    it('should reject unauthorized access from Client', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks/search/supplier/TestSupplier')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('PUT /stocks/:id', () => {
    it('should update stock item successfully as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const updateStockItemDto = {
        name: 'Updated Stock Item Name',
        description: 'Updated description',
        currentStock: 75,
        unitSalePrice: '60.00',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateStockItemDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: stockItem.id,
        name: 'Updated Stock Item Name',
        description: 'Updated description',
        currentStock: 75,
        unitSalePrice: expect.stringMatching(/60,00/),
        sku: stockItem.sku, // SKU should remain unchanged
      })
    })

    it('should update stock item successfully as Admin', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const updateStockItemDto = {
        name: 'Admin Updated Item',
        supplier: 'New Supplier',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateStockItemDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: stockItem.id,
        name: 'Admin Updated Item',
        supplier: 'New Supplier',
      })
    })

    it('should return 404 for non-existent stock item', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const updateStockItemDto = {
        name: 'Should not work',
      }

      await request(testBase.getHttpServer())
        .put(`/stocks/${nonExistentId}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateStockItemDto)
        .expect(404)
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const updateStockItemDto = {
        name: 'Unauthorized Update',
      }

      await request(testBase.getHttpServer())
        .put(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(updateStockItemDto)
        .expect(403)
    })
  })

  describe('DELETE /stocks/:id', () => {
    it('should delete stock item successfully as Admin', async () => {
      // Create a new stock item to delete
      const newStockItem = await testBase.prismaService.stockItem.create({
        data: {
          name: 'Item to Delete',
          sku: 'ITD-001',
          currentStock: 0,
          minStockLevel: 0,
          unitCost: 10.0,
          unitSalePrice: 20.0,
        },
      })

      await request(testBase.getHttpServer())
        .delete(`/stocks/${newStockItem.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(204)

      // Verify the item is deleted
      const deletedItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: newStockItem.id },
      })
      expect(deletedItem).toBeNull()
    })

    it('should return 404 for non-existent stock item', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      await request(testBase.getHttpServer())
        .delete(`/stocks/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404)
    })

    it('should reject deletion from Employee (only Admin allowed)', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      await request(testBase.getHttpServer())
        .delete(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(403)
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      await request(testBase.getHttpServer())
        .delete(`/stocks/${stockItem.id}`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('POST /stocks/movements', () => {
    it('should create stock movement successfully as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const createMovementDto = {
        stockId: stockItem.id,
        type: 'IN',
        quantity: 20,
        reason: 'Restocking inventory',
        movementDate: new Date().toISOString(),
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createMovementDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        stockId: stockItem.id,
        type: 'IN',
        quantity: 20,
        reason: 'Restocking inventory',
        movementDate: expect.any(String),
      })
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const createMovementDto = {
        stockItemId: stockItem.id,
        type: 'IN',
        quantity: 10,
        unitCost: '25.00',
        reason: 'Should fail',
      }

      await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(createMovementDto)
        .expect(403)
    })
  })

  describe('POST /stocks/:id/decrease', () => {
    it('should decrease stock successfully as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      // Get current stock level
      const currentItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: stockItem.id },
      })

      const decreaseDto = {
        quantity: 5,
        reason: 'Used in service',
      }

      const response = await request(testBase.getHttpServer())
        .post(`/stocks/${stockItem.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseDto)
        .expect(201)

      expect(response.body).toMatchObject({
        id: stockItem.id,
        currentStock: currentItem!.currentStock - 5,
      })
    })

    it('should reject decrease when insufficient stock', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const decreaseDto = {
        quantity: 999999, // More than available stock
        reason: 'Should fail',
      }

      await request(testBase.getHttpServer())
        .post(`/stocks/${stockItem.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseDto)
        .expect(400)
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      const decreaseDto = {
        quantity: 1,
        reason: 'Should fail',
      }

      await request(testBase.getHttpServer())
        .post(`/stocks/${stockItem.id}/decrease`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(decreaseDto)
        .expect(403)
    })
  })

  describe('GET /stocks/check/sku/:sku', () => {
    it('should check SKU availability as Employee', async () => {
      const testData = dataFactory.getTestData()
      const existingSku = testData.stockItems[0].sku

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/sku/${existingSku}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        exists: true,
        sku: existingSku,
      })
    })

    it('should return false for non-existent SKU', async () => {
      const nonExistentSku = 'NON-EXISTENT-SKU'

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/sku/${nonExistentSku}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        exists: false,
        sku: nonExistentSku,
      })
    })

    it('should reject unauthorized access from Client', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks/check/sku/TEST-SKU')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })

  describe('GET /stocks/check/stock/:id/:quantity', () => {
    it('should check stock availability as Employee', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]
      const checkQuantity = 1 // Should be available

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/stock/${stockItem.id}/${checkQuantity}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        available: expect.any(Boolean),
        requestedQuantity: checkQuantity,
        currentStock: expect.any(Number),
      })
    })

    it('should return false for insufficient stock', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]
      const checkQuantity = 999999 // Should not be available

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/stock/${stockItem.id}/${checkQuantity}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        available: false,
        requestedQuantity: checkQuantity,
      })
    })

    it('should reject unauthorized access from Client', async () => {
      const testData = dataFactory.getTestData()
      const stockItem = testData.stockItems[0]

      await request(testBase.getHttpServer())
        .get(`/stocks/check/stock/${stockItem.id}/1`)
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(403)
    })
  })
})
