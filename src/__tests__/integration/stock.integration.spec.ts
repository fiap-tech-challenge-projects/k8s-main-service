import { HttpStatus } from '@nestjs/common'
import { StockMovementType } from '@prisma/client'
import * as request from 'supertest'

import {
  CreateStockItemDto,
  UpdateStockItemDto,
  CreateStockMovementDto,
  UpdateStockMovementDto,
} from '@application/stock/dto'

import { IntegrationTestDataFactory } from '../factories'
import { StockItemFactory } from '../factories/entities'

import { IntegrationTestBase } from './integration-test-base'

describe('Stock Integration Tests', () => {
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
    dataFactory.resetTestData() // Reset factory state before creating new test data
    await dataFactory.initializeTestData()
    const testData = dataFactory.getTestData()

    // Create JWT tokens directly using test data - bypassing login
    adminAuthToken = testBase.authUtils.createTestToken({
      id: testData.adminUser.id,
      email: testData.adminUser.email,
      role: testData.adminUser.role,
      employeeId: testData.employee.id, // Admin can use the general employee record
    })

    employeeAuthToken = testBase.authUtils.createTestToken({
      id: testData.employeeUser.id,
      email: testData.employeeUser.email,
      role: testData.employeeUser.role,
      employeeId: testData.employee.id,
    })

    clientAuthToken = testBase.authUtils.createTestToken({
      id: testData.clientUser.id,
      email: testData.clientUser.email,
      role: testData.clientUser.role,
      clientId: testData.client.id,
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

  describe('POST /stocks', () => {
    it('should create a stock item successfully as EMPLOYEE', async () => {
      const createDto: CreateStockItemDto = {
        name: 'Filtro de Óleo',
        sku: 'FLT-001',
        currentStock: 15,
        minStockLevel: 5,
        unitCost: '25.50',
        unitSalePrice: '50.00',
        description: 'Filtro de óleo automotivo',
        supplier: 'Bosch',
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        name: createDto.name,
        sku: createDto.sku,
        currentStock: createDto.currentStock,
        minStockLevel: createDto.minStockLevel,
        unitCost: expect.stringMatching(/^R\$\s*25,50$/),
        unitSalePrice: expect.stringMatching(/^R\$\s*50,00$/),
        description: createDto.description,
        supplier: createDto.supplier,
      })
      expect(response.body.id).toBeDefined()
      expect(response.body.createdAt).toBeDefined()
      expect(response.body.updatedAt).toBeDefined()
    })

    it('should create a stock item successfully as ADMIN', async () => {
      const createDto: CreateStockItemDto = {
        name: 'Pneu Aro 15',
        sku: 'PNE-001',
        currentStock: 8,
        minStockLevel: 2,
        unitCost: '200.00',
        unitSalePrice: '300.00',
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        name: createDto.name,
        sku: createDto.sku,
        currentStock: createDto.currentStock,
        minStockLevel: createDto.minStockLevel,
        unitCost: expect.stringMatching(/^R\$\s*200,00$/),
        unitSalePrice: expect.stringMatching(/^R\$\s*300,00$/),
      })
    })

    it('should return 403 when creating stock item as CLIENT', async () => {
      const createDto: CreateStockItemDto = {
        name: 'Test Item',
        sku: 'TST-001',
        currentStock: 10,
        minStockLevel: 5,
        unitCost: '10.00',
        unitSalePrice: '20.00',
      }

      await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(createDto)
        .expect(HttpStatus.FORBIDDEN)
    })

    it('should return 400 when creating stock item with duplicate SKU', async () => {
      const stockItem = StockItemFactory.create({ sku: 'DUP-001' })
      await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const createDto: CreateStockItemDto = {
        name: 'Duplicate SKU Item',
        sku: 'DUP-001',
        currentStock: 5,
        minStockLevel: 2,
        unitCost: '15.00',
        unitSalePrice: '30.00',
      }

      await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createDto)
        .expect(HttpStatus.CONFLICT)
    })

    it('should return 400 when creating stock item with invalid data', async () => {
      const invalidDto = {
        name: '', // Invalid: empty name
        sku: 'TST-001',
        currentStock: -1, // Invalid: negative stock
        minStockLevel: 5,
        unitCost: '10.00',
        unitSalePrice: '20.00',
      }

      await request(testBase.getHttpServer())
        .post('/stocks')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })

  describe('GET /stocks', () => {
    it('should list stock items successfully as EMPLOYEE', async () => {
      // Create test stock items
      const stockItem1 = StockItemFactory.create({ sku: 'LIST-001', name: 'Item 1' })
      const stockItem2 = StockItemFactory.create({ sku: 'LIST-002', name: 'Item 2' })

      await testBase.prismaService.stockItem.createMany({
        data: [
          {
            id: stockItem1.id,
            name: stockItem1.name,
            sku: stockItem1.sku,
            currentStock: stockItem1.currentStock,
            minStockLevel: stockItem1.minStockLevel,
            unitCost: stockItem1.unitCost.getValue(),
            unitSalePrice: stockItem1.unitSalePrice.getValue(),
            description: stockItem1.description,
            supplier: stockItem1.supplier,
            createdAt: stockItem1.createdAt,
            updatedAt: stockItem1.updatedAt,
          },
          {
            id: stockItem2.id,
            name: stockItem2.name,
            sku: stockItem2.sku,
            currentStock: stockItem2.currentStock,
            minStockLevel: stockItem2.minStockLevel,
            unitCost: stockItem2.unitCost.getValue(),
            unitSalePrice: stockItem2.unitSalePrice.getValue(),
            description: stockItem2.description,
            supplier: stockItem2.supplier,
            createdAt: stockItem2.createdAt,
            updatedAt: stockItem2.updatedAt,
          },
        ],
      })

      const response = await request(testBase.getHttpServer())
        .get('/stocks')
        .expect(HttpStatus.OK)
        .set('Authorization', `Bearer ${employeeAuthToken}`)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(response.body.meta).toHaveProperty('total')
      expect(response.body.meta).toHaveProperty('page')
      expect(response.body.meta).toHaveProperty('limit')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })

    it('should list stock items successfully as ADMIN', async () => {
      testBase.authUtils.setupAdminContext('test-admin-1', 'admin@test.com')

      const response = await request(testBase.getHttpServer())
        .get('/stocks')
        .expect(HttpStatus.OK)
        .set('Authorization', `Bearer ${employeeAuthToken}`)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(response.body.meta).toHaveProperty('total')
    })

    it('should return 403 when listing stock items as CLIENT', async () => {
      testBase.authUtils.setupClientContext('test-client-1', 'client@test.com', 'client-1')

      await request(testBase.getHttpServer())
        .get('/stocks')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(HttpStatus.FORBIDDEN)
    })

    it('should support pagination', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/stocks?page=1&limit=5')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body.meta.page).toBe(1)
      expect(response.body.meta.limit).toBe(5)
    })
  })

  describe('GET /stocks/:id', () => {
    it('should get stock item by ID successfully as EMPLOYEE', async () => {
      const stockItem = StockItemFactory.create({ sku: 'GET-001' })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/${created.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        id: created.id,
        name: stockItem.name,
        sku: stockItem.sku,
        currentStock: stockItem.currentStock,
        minStockLevel: stockItem.minStockLevel,
      })
    })

    it('should return 404 when stock item not found', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks/non-existent-id')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it('should return 403 when getting stock item as CLIENT', async () => {
      testBase.authUtils.setupClientContext('test-client-1', 'client@test.com', 'client-1')

      await request(testBase.getHttpServer())
        .get('/stocks/some-id')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .expect(HttpStatus.FORBIDDEN)
    })
  })

  describe('PUT /stocks/:id', () => {
    it('should update stock item successfully as EMPLOYEE', async () => {
      const stockItem = StockItemFactory.create({ sku: 'UPD-001' })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const updateDto: UpdateStockItemDto = {
        name: 'Updated Item Name',
        currentStock: 25,
        unitCost: '30.00',
        unitSalePrice: '60.00',
      }

      const response = await request(testBase.getHttpServer())
        .put(`/stocks/${created.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        id: created.id,
        name: updateDto.name,
        currentStock: updateDto.currentStock,
        unitCost: expect.stringMatching(/^R\$\s*30,00$/),
        unitSalePrice: expect.stringMatching(/^R\$\s*60,00$/),
      })
    })

    it('should return 404 when updating non-existent stock item', async () => {
      const updateDto: UpdateStockItemDto = {
        name: 'Updated Name',
      }

      await request(testBase.getHttpServer())
        .put('/stocks/non-existent-id')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND)
    })

    it('should return 403 when updating stock item as CLIENT', async () => {
      testBase.authUtils.setupClientContext('test-client-1', 'client@test.com', 'client-1')

      const updateDto: UpdateStockItemDto = {
        name: 'Updated Name',
      }

      await request(testBase.getHttpServer())
        .put('/stocks/some-id')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(updateDto)
        .expect(HttpStatus.FORBIDDEN)
    })
  })

  describe('DELETE /stocks/:id', () => {
    it('should delete stock item successfully as ADMIN', async () => {
      testBase.authUtils.setupAdminContext('test-admin-1', 'admin@test.com')

      const stockItem = StockItemFactory.create({ sku: 'DEL-001' })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      await request(testBase.getHttpServer())
        .delete(`/stocks/${created.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(HttpStatus.NO_CONTENT)

      // Verify the item was deleted
      const deletedItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: created.id },
      })
      expect(deletedItem).toBeNull()
    })

    it('should return 403 when deleting stock item as EMPLOYEE', async () => {
      await request(testBase.getHttpServer())
        .delete('/stocks/some-id')
        .expect(HttpStatus.FORBIDDEN)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
    })

    it('should return 404 when deleting non-existent stock item', async () => {
      testBase.authUtils.setupAdminContext('test-admin-1', 'admin@test.com')

      await request(testBase.getHttpServer())
        .delete('/stocks/non-existent-id')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /stocks/search/sku/:sku', () => {
    it('should search stock item by SKU successfully', async () => {
      const stockItem = StockItemFactory.create({ sku: 'SEARCH-SKU-001' })
      await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/search/sku/${stockItem.sku}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        sku: stockItem.sku,
        name: stockItem.name,
      })
    })

    it('should return 404 when SKU not found', async () => {
      await request(testBase.getHttpServer())
        .get('/stocks/search/sku/NON-EXISTENT-SKU')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('GET /stocks/search/name/:name', () => {
    it('should search stock items by name successfully', async () => {
      const stockItem = StockItemFactory.create({
        name: 'Filtro de Ar Especial',
        sku: 'FLT-AR-001',
      })
      await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get('/stocks/search/name/Filtro')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data.some((item: any) => item.name.includes('Filtro'))).toBe(true)
    })
  })

  describe('GET /stocks/search/supplier/:supplier', () => {
    it('should search stock items by supplier successfully', async () => {
      const stockItem = StockItemFactory.create({ supplier: 'Bosch Brasil', sku: 'BOSCH-001' })
      await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get('/stocks/search/supplier/Bosch')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data.some((item: any) => item.supplier?.includes('Bosch'))).toBe(true)
    })
  })

  describe('GET /stocks/check/sku/:sku', () => {
    it('should check if SKU exists successfully', async () => {
      const stockItem = StockItemFactory.create({ sku: 'CHECK-SKU-001' })
      await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/sku/${stockItem.sku}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({ exists: true, sku: stockItem.sku })
    })

    it('should return false when SKU does not exist', async () => {
      const response = await request(testBase.getHttpServer())
        .get('/stocks/check/sku/NON-EXISTENT-SKU')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({ exists: false, sku: 'NON-EXISTENT-SKU' })
    })
  })

  describe('GET /stocks/check/stock/:id/:quantity', () => {
    it('should check stock availability successfully', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'CHECK-STOCK-001',
        currentStock: 20,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/stock/${created.id}/10`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        available: true,
        currentStock: 20,
        requestedQuantity: 10,
      })
    })

    it('should return false when insufficient stock', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'CHECK-STOCK-002',
        currentStock: 5,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const response = await request(testBase.getHttpServer())
        .get(`/stocks/check/stock/${created.id}/10`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        available: false,
        currentStock: 5,
        requestedQuantity: 10,
      })
    })
  })

  describe('POST /stocks/movements', () => {
    it('should create stock movement successfully as EMPLOYEE', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'MOV-CREATE-001',
        currentStock: 20,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const createMovementDto: CreateStockMovementDto = {
        stockId: created.id,
        type: StockMovementType.IN,
        quantity: 10,
        reason: 'New stock received',
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createMovementDto)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        stockId: created.id,
        type: 'IN',
        quantity: 10,
        reason: 'New stock received',
      })
      expect(response.body.id).toBeDefined()
      expect(response.body.createdAt).toBeDefined()

      // Verify stock was updated
      const updatedStockItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: created.id },
      })
      expect(updatedStockItem?.currentStock).toBe(30) // 20 + 10
    })

    it('should create stock movement successfully as ADMIN', async () => {
      testBase.authUtils.setupAdminContext('test-admin-1', 'admin@test.com')

      const stockItem = StockItemFactory.create({
        sku: 'MOV-CREATE-ADMIN-001',
        currentStock: 15,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const createMovementDto: CreateStockMovementDto = {
        stockId: created.id,
        type: StockMovementType.OUT,
        quantity: 5,
        reason: 'Used in service order',
      }

      const response = await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createMovementDto)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        stockId: created.id,
        type: 'OUT',
        quantity: 5,
        reason: 'Used in service order',
      })

      // Verify stock was updated
      const updatedStockItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: created.id },
      })
      expect(updatedStockItem?.currentStock).toBe(10) // 15 - 5
    })

    it('should return 403 when creating stock movement as CLIENT', async () => {
      testBase.authUtils.setupClientContext('test-client-1', 'client@test.com', 'client-1')

      const createMovementDto: CreateStockMovementDto = {
        stockId: 'some-id',
        type: StockMovementType.IN,
        quantity: 10,
        reason: 'Test movement',
      }

      await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(createMovementDto)
        .expect(HttpStatus.FORBIDDEN)
    })

    it('should return 400 when creating movement with insufficient stock for EXIT', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'MOV-INSUFFICIENT-001',
        currentStock: 5,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const createMovementDto: CreateStockMovementDto = {
        stockId: created.id,
        type: StockMovementType.OUT,
        quantity: 10,
        reason: 'Trying to take more than available',
      }

      await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createMovementDto)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 404 when creating movement for non-existent stock item', async () => {
      const createMovementDto: CreateStockMovementDto = {
        stockId: 'non-existent-id',
        type: StockMovementType.IN,
        quantity: 10,
        reason: 'Movement for non-existent item',
      }

      await request(testBase.getHttpServer())
        .post('/stocks/movements')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(createMovementDto)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('PUT /stocks/movements/:id', () => {
    it('should update stock movement successfully as EMPLOYEE', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'MOV-UPDATE-001',
        currentStock: 20,
      })
      const createdStockItem = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      // Create a stock movement first
      const movement = await testBase.prismaService.stockMovement.create({
        data: {
          id: 'movement-1',
          stockItem: { connect: { id: createdStockItem.id } },
          type: 'IN',
          quantity: 10,
          reason: 'Initial movement',
          createdAt: new Date(),
        },
      })

      const updateMovementDto: UpdateStockMovementDto = {
        reason: 'Updated movement description',
        quantity: 15,
      }

      const response = await request(testBase.getHttpServer())
        .put(`/stocks/movements/${movement.id}`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateMovementDto)
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        id: movement.id,
        reason: 'Updated movement description',
        quantity: 15,
      })
    })

    it('should return 500 when updating non-existent movement due to internal error', async () => {
      const updateMovementDto: UpdateStockMovementDto = {
        reason: 'Updated description',
      }

      await request(testBase.getHttpServer())
        .put('/stocks/movements/non-existent-id')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(updateMovementDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
    })

    it('should return 403 when updating movement as CLIENT', async () => {
      testBase.authUtils.setupClientContext('test-client-1', 'client@test.com', 'client-1')

      const updateMovementDto: UpdateStockMovementDto = {
        reason: 'Updated description',
      }

      await request(testBase.getHttpServer())
        .put('/stocks/movements/some-id')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(updateMovementDto)
        .expect(HttpStatus.FORBIDDEN)
    })
  })

  describe('POST /stocks/:id/decrease', () => {
    it('should decrease stock successfully as EMPLOYEE', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'DECREASE-001',
        currentStock: 20,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const decreaseData = {
        quantity: 5,
        reason: 'Used in service order SO-123',
      }

      const response = await request(testBase.getHttpServer())
        .post(`/stocks/${created.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        id: created.id,
        currentStock: 15, // 20 - 5
        name: expect.any(String),
        sku: expect.any(String),
      })

      // Verify stock was decreased
      const updatedStockItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: created.id },
      })
      expect(updatedStockItem?.currentStock).toBe(15) // 20 - 5
    })

    it('should decrease stock successfully as ADMIN', async () => {
      testBase.authUtils.setupAdminContext('test-admin-1', 'admin@test.com')

      const stockItem = StockItemFactory.create({
        sku: 'DECREASE-ADMIN-001',
        currentStock: 30,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const decreaseData = {
        quantity: 10,
        reason: 'Budget approved for project XYZ',
      }

      const response = await request(testBase.getHttpServer())
        .post(`/stocks/${created.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        id: created.id,
        currentStock: 20, // 30 - 10
        name: expect.any(String),
        sku: expect.any(String),
      })

      // Verify stock was decreased
      const updatedStockItem = await testBase.prismaService.stockItem.findUnique({
        where: { id: created.id },
      })
      expect(updatedStockItem?.currentStock).toBe(20) // 30 - 10
    })

    it('should return 403 when decreasing stock as CLIENT', async () => {
      testBase.authUtils.setupClientContext('test-client-1', 'client@test.com', 'client-1')

      const decreaseData = {
        quantity: 5,
        reason: 'Client trying to decrease stock',
      }

      await request(testBase.getHttpServer())
        .post('/stocks/some-id/decrease')
        .set('Authorization', `Bearer ${clientAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.FORBIDDEN)
    })

    it('should return 400 when decreasing more stock than available', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'DECREASE-INS-001',
        currentStock: 5,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const decreaseData = {
        quantity: 10, // More than available stock
        reason: 'Trying to decrease more than available',
      }

      await request(testBase.getHttpServer())
        .post(`/stocks/${created.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 404 when decreasing stock for non-existent item', async () => {
      const decreaseData = {
        quantity: 5,
        reason: 'Decrease for non-existent item',
      }

      await request(testBase.getHttpServer())
        .post('/stocks/non-existent-id/decrease')
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.NOT_FOUND)
    })

    it('should return 400 when providing invalid quantity', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'DECREASE-INVALID-001',
        currentStock: 20,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const decreaseData = {
        quantity: -5, // Invalid negative quantity
        reason: 'Invalid quantity test',
      }

      await request(testBase.getHttpServer())
        .post(`/stocks/${created.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 when providing empty reason', async () => {
      const stockItem = StockItemFactory.create({
        sku: 'DECREASE-NOR-001',
        currentStock: 20,
      })
      const created = await testBase.prismaService.stockItem.create({
        data: {
          id: stockItem.id,
          name: stockItem.name,
          sku: stockItem.sku,
          currentStock: stockItem.currentStock,
          minStockLevel: stockItem.minStockLevel,
          unitCost: stockItem.unitCost.getValue(),
          unitSalePrice: stockItem.unitSalePrice.getValue(),
          description: stockItem.description,
          supplier: stockItem.supplier,
          createdAt: stockItem.createdAt,
          updatedAt: stockItem.updatedAt,
        },
      })

      const decreaseData = {
        quantity: 5,
        reason: '', // Empty reason
      }

      await request(testBase.getHttpServer())
        .post(`/stocks/${created.id}/decrease`)
        .set('Authorization', `Bearer ${employeeAuthToken}`)
        .send(decreaseData)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
