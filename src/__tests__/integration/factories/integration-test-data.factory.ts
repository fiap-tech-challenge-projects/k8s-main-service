import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

import { PrismaService } from '@infra/database/prisma/prisma.service'

const DEFAULT_PASSWORD = 'TestPassword123!'

/**
 * Factory for creating test data for integration tests
 */
@Injectable()
export class IntegrationTestDataFactory {
  private testData: any = null
  private testRunId: string

  constructor(private readonly prisma: PrismaService) {
    const nanoTime = process.hrtime.bigint().toString()
    const processId = process.pid.toString()
    this.testRunId = `${nanoTime.slice(-6)}${processId.slice(-2)}${Math.random().toString(36).substring(2, 4)}`
  }

  /**
   * Initialize test data with unique identifiers
   */
  async initializeTestData() {
    if (this.testData) {
      return this.testData
    }

    try {
      // Use a transaction to ensure atomicity and avoid foreign key constraint issues
      this.testData = await this.prisma.$transaction(async (prisma) => {
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12)

        // Create client first
        const client = await prisma.client.create({
          data: {
            name: 'Test Client',
            email: `test-client-${this.testRunId}@example.com`,
            cpfCnpj: this.generateUniqueCpf(), // Generate unique CPF per test run
            phone: '(11) 99999-9999',
            address: 'Test Address 123',
          },
        })

        // Create employee first
        const employee = await prisma.employee.create({
          data: {
            name: 'Test Employee',
            email: `test-employee-${this.testRunId}@example.com`,
            phone: '+5511888888888',
            role: 'MECHANIC',
            specialty: 'General',
            isActive: true,
          },
        })

        // Create users
        const adminUser = await prisma.user.create({
          data: {
            email: `admin-${this.testRunId}@example.com`,
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
          },
        })

        const clientUser = await prisma.user.create({
          data: {
            email: `client-${this.testRunId}@example.com`,
            password: hashedPassword,
            role: 'CLIENT',
            isActive: true,
            clientId: client.id,
          },
        })

        const employeeUser = await prisma.user.create({
          data: {
            email: `employee-${this.testRunId}@example.com`,
            password: hashedPassword,
            role: 'EMPLOYEE',
            isActive: true,
            employeeId: employee.id,
          },
        })

        // Generate valid Brazilian license plate format: ABC-1234 (Troubleshooting Guide Section 8)
        const plateLetters = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        const plateNumbers = Math.floor(1000 + Math.random() * 9000).toString()
        const licensePlate = `${plateLetters}-${plateNumbers}`

        // Generate valid VIN: 17 characters using valid characters (Troubleshooting Guide Section 8)
        const vinChars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
        const generatedVin = Array.from(
          { length: 17 },
          () => vinChars[Math.floor(Math.random() * vinChars.length)],
        ).join('')

        const vehicle = await prisma.vehicle.create({
          data: {
            licensePlate,
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            color: 'White',
            vin: generatedVin,
            clientId: client.id,
          },
        })

        // Create multiple services
        const services = await Promise.all([
          prisma.service.create({
            data: {
              name: 'Oil Change',
              description: 'Complete oil change service',
              price: 15000,
              estimatedDuration: 60,
              isActive: true,
            },
          }),
          prisma.service.create({
            data: {
              name: 'Brake Inspection',
              description: 'Comprehensive brake system inspection',
              price: 8000,
              estimatedDuration: 45,
              isActive: true,
            },
          }),
          prisma.service.create({
            data: {
              name: 'Tire Rotation',
              description: 'Tire rotation and balance',
              price: 12000,
              estimatedDuration: 30,
              isActive: true,
            },
          }),
        ])

        // Create multiple stock items
        const stockItems = await Promise.all([
          prisma.stockItem.create({
            data: {
              name: 'Oil Filter',
              description: 'High-quality oil filter',
              sku: `OIL-FILTER-${this.testRunId}`,
              currentStock: 50,
              minStockLevel: 10,
              unitCost: 1500,
              unitSalePrice: 3000,
              supplier: 'Filter Supplier Co.',
            },
          }),
          prisma.stockItem.create({
            data: {
              name: 'Brake Pads',
              description: 'Premium brake pads',
              sku: `BRAKE-PADS-${this.testRunId}`,
              currentStock: 30,
              minStockLevel: 5,
              unitCost: 4000,
              unitSalePrice: 8000,
              supplier: 'Brake Supplier Co.',
            },
          }),
          prisma.stockItem.create({
            data: {
              name: 'Air Filter',
              description: 'Engine air filter',
              sku: `AIR-FILTER-${this.testRunId}`,
              currentStock: 25,
              minStockLevel: 5,
              unitCost: 1200,
              unitSalePrice: 2500,
              supplier: 'Filter Supplier Co.',
            },
          }),
        ])

        return {
          adminUser,
          clientUser,
          employeeUser,
          client,
          employee,
          vehicle,
          services,
          stockItems,
        }
      })

      return this.testData
    } catch (error) {
      // If initialization fails, reset state and provide better error message
      this.testData = null
      throw new Error(
        `Failed to initialize test data for testRunId ${this.testRunId}: ${error.message}`,
      )
    }
  }

  /**
   * Get the initialized test data
   */
  getTestData() {
    if (!this.testData) {
      throw new Error('Test data not initialized. Call initializeTestData() first.')
    }
    return this.testData
  }

  /**
   * Reset test data state (does not delete from database)
   */
  resetTestData() {
    this.testData = null
    this.testRunId = Math.random().toString(36).substring(2, 8)
  }

  /**
   * Clean up all test data from database
   */
  async cleanupTestData() {
    if (!this.testData) {
      return
    }

    // Delete in reverse order to avoid foreign key constraints
    await this.prisma.budgetItem.deleteMany({
      where: {
        budget: {
          serviceOrder: {
            clientId: this.testData.client.id,
          },
        },
      },
    })

    await this.prisma.serviceExecution.deleteMany({
      where: {
        serviceOrder: {
          clientId: this.testData.client.id,
        },
      },
    })

    await this.prisma.vehicleEvaluation.deleteMany({
      where: {
        serviceOrder: {
          clientId: this.testData.client.id,
        },
      },
    })

    await this.prisma.budget.deleteMany({
      where: {
        clientId: this.testData.client.id,
      },
    })

    await this.prisma.serviceOrder.deleteMany({
      where: {
        clientId: this.testData.client.id,
      },
    })

    await this.prisma.vehicle.deleteMany({
      where: {
        clientId: this.testData.client.id,
      },
    })

    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: [
            this.testData.adminUser.id,
            this.testData.clientUser.id,
            this.testData.employeeUser.id,
          ],
        },
      },
    })

    await this.prisma.client.deleteMany({
      where: {
        id: this.testData.client.id,
      },
    })

    await this.prisma.employee.deleteMany({
      where: {
        id: this.testData.employee.id,
      },
    })

    await this.prisma.service.deleteMany({
      where: {
        id: {
          in: this.testData.services.map((s: any) => s.id),
        },
      },
    })

    await this.prisma.stockItem.deleteMany({
      where: {
        id: {
          in: this.testData.stockItems.map((s: any) => s.id),
        },
      },
    })

    this.testData = null
  }

  /**
   * Creates a service order with the test data.
   */
  async createServiceOrder(serviceOrderData?: Partial<Prisma.ServiceOrderCreateInput>) {
    // Instead of relying on cached testData, fetch fresh data from database
    // to avoid foreign key constraint issues
    const client = await this.prisma.client.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    const vehicle = await this.prisma.vehicle.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!client || !vehicle) {
      throw new Error(
        'No client or vehicle found in database. Make sure to call initializeTestData() first.',
      )
    }

    return this.prisma.serviceOrder.create({
      data: {
        status: serviceOrderData?.status ?? 'RECEIVED',
        notes: serviceOrderData?.notes ?? 'Test service order notes',
        clientId: client.id,
        vehicleId: vehicle.id,
        ...(serviceOrderData as any),
      },
      include: {
        client: true,
        vehicle: true,
      },
    })
  }

  /**
   * Creates a budget with the test data.
   */
  async createBudget(budgetData?: Partial<Prisma.BudgetCreateInput>) {
    const { client } = this.getTestData()
    const serviceOrder = await this.createServiceOrder()

    return this.prisma.budget.create({
      data: {
        totalAmount: budgetData?.totalAmount ?? 50000,
        status: budgetData?.status ?? 'GENERATED',
        validityPeriod: budgetData?.validityPeriod ?? 7,
        notes: budgetData?.notes ?? 'Test budget notes',
        clientId: client.id,
        serviceOrderId: serviceOrder.id,
      },
      include: {
        client: true,
        serviceOrder: true,
      },
    })
  }

  /**
   * Creates a budget item with the test data.
   */
  async createBudgetItem(
    budgetId: string,
    type: 'SERVICE' | 'STOCK_ITEM' = 'SERVICE',
    budgetItemData?: Partial<Prisma.BudgetItemCreateInput>,
  ) {
    const { services, stockItems } = this.getTestData()

    const baseData = {
      description: budgetItemData?.description ?? 'Test budget item',
      quantity: budgetItemData?.quantity ?? 1,
      unitPrice: budgetItemData?.unitPrice ?? 10000,
      totalPrice: budgetItemData?.totalPrice ?? 10000,
      notes: budgetItemData?.notes ?? 'Test budget item notes',
      budgetId,
    }

    if (type === 'SERVICE') {
      return this.prisma.budgetItem.create({
        data: {
          ...baseData,
          type: 'SERVICE',
          serviceId: services[0].id,
        },
        include: {
          service: true,
          stockItem: true,
        },
      })
    } else {
      return this.prisma.budgetItem.create({
        data: {
          ...baseData,
          type: 'STOCK_ITEM',
          stockItemId: stockItems[0].id,
        },
        include: {
          service: true,
          stockItem: true,
        },
      })
    }
  }

  /**
   * Creates a service execution with the test data.
   */
  async createServiceExecution(
    serviceOrderId: string,
    serviceExecutionData?: Partial<Prisma.ServiceExecutionCreateInput>,
  ) {
    const { employee } = this.getTestData()

    return this.prisma.serviceExecution.create({
      data: {
        status: serviceExecutionData?.status ?? 'ASSIGNED',
        startTime: serviceExecutionData?.startTime ?? new Date(),
        endTime: serviceExecutionData?.endTime,
        notes: serviceExecutionData?.notes ?? 'Test service execution notes',
        serviceOrderId,
        mechanicId: employee.id,
      },
      include: {
        serviceOrder: true,
        mechanic: true,
      },
    })
  }

  /**
   * Creates a vehicle evaluation with the test data.
   */
  async createVehicleEvaluation(
    serviceOrderId: string,
    vehicleEvaluationData?: Partial<Prisma.VehicleEvaluationCreateInput>,
  ) {
    const { vehicle } = this.getTestData()

    return this.prisma.vehicleEvaluation.create({
      data: {
        details: vehicleEvaluationData?.details ?? {
          engine: 'Good condition',
          transmission: 'Smooth operation',
          brakes: 'Need inspection',
          tires: 'Good tread',
        },
        evaluationDate: vehicleEvaluationData?.evaluationDate ?? new Date(),
        mechanicNotes: vehicleEvaluationData?.mechanicNotes ?? 'Test evaluation notes',
        serviceOrderId,
        vehicleId: vehicle.id,
      },
      include: {
        serviceOrder: true,
        vehicle: true,
      },
    })
  }

  /**
   * Creates a stock movement with the test data.
   */
  async createStockMovement(
    stockItemId: string,
    stockMovementData?: Partial<Prisma.StockMovementCreateInput>,
  ) {
    return this.prisma.stockMovement.create({
      data: {
        type: stockMovementData?.type ?? 'IN',
        quantity: stockMovementData?.quantity ?? 10,
        reason: stockMovementData?.reason ?? 'Test stock movement',
        stockId: stockItemId,
        movementDate: stockMovementData?.movementDate ?? new Date(),
      },
      include: {
        stockItem: true,
      },
    })
  }

  /**
   * Creates a stock order with the test data.
   */
  async createStockOrder(stockOrderData?: Partial<Prisma.StockOrderCreateInput>) {
    const { stockItems } = this.getTestData()

    return this.prisma.stockOrder.create({
      data: {
        status: stockOrderData?.status ?? 'REQUESTED',
        quantity: stockOrderData?.quantity ?? 5,
        orderDate: stockOrderData?.orderDate ?? new Date(),
        expectedDeliveryDate:
          stockOrderData?.expectedDeliveryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: stockOrderData?.notes ?? 'Test stock order notes',
        stockId: stockItems[0].id,
      },
      include: {
        stockItem: true,
      },
    })
  }

  /**
   * Creates a complete test scenario with all related entities.
   */
  async createCompleteTestScenario() {
    const testData = this.getTestData()

    // Create a service order
    const serviceOrder = await this.createServiceOrder()

    // Create a budget
    const budget = await this.createBudget({
      serviceOrder: {
        connect: {
          id: serviceOrder.id,
        },
      },
    })

    // Create budget items
    const budgetItems = await Promise.all([
      this.createBudgetItem(budget.id, 'SERVICE'),
      this.createBudgetItem(budget.id, 'STOCK_ITEM'),
    ])

    // Create a service execution
    const serviceExecution = await this.createServiceExecution(serviceOrder.id)

    // Create a vehicle evaluation
    const vehicleEvaluation = await this.createVehicleEvaluation(serviceOrder.id)

    // Create stock movements
    const stockMovements = await Promise.all([
      this.createStockMovement(testData.stockItems[0].id, { type: 'IN', quantity: 20 }),
      this.createStockMovement(testData.stockItems[0].id, { type: 'OUT', quantity: 5 }),
    ])

    // Create a stock order
    const stockOrder = await this.createStockOrder()

    return {
      serviceOrder,
      budget,
      budgetItems,
      serviceExecution,
      vehicleEvaluation,
      stockMovements,
      stockOrder,
    }
  }

  /**
   * Generates JWT tokens for testing authentication.
   */
  async generateAuthTokens(userType: 'admin' | 'client' | 'employee') {
    const testData = this.getTestData()

    let user: any
    switch (userType) {
      case 'admin':
        user = testData.adminUser
        break
      case 'client':
        user = testData.clientUser
        break
      case 'employee':
        user = testData.employeeUser
        break
      default:
        throw new Error(`Invalid user type: ${userType}`)
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      employeeId: user.employeeId,
    }

    // Fallback for when JWT service is not available
    const token = Buffer.from(JSON.stringify(payload)).toString('base64')
    return `Bearer ${token}`
  }

  /**
   * Generate a unique valid CPF for testing
   * Uses a valid CPF algorithm to generate proper test data
   */
  private generateUniqueCpf(): string {
    // Generate the first 9 digits randomly (avoid all same digits)
    const firstNineDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))

    // Ensure not all digits are the same (invalid CPF pattern)
    while (firstNineDigits.every((digit) => digit === firstNineDigits[0])) {
      for (let i = 0; i < 9; i++) {
        firstNineDigits[i] = Math.floor(Math.random() * 10)
      }
    }

    // Calculate first check digit using Brazilian CPF algorithm (same as codebase)
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += firstNineDigits[i] * (10 - i)
    }
    let remainder = sum % 11
    const firstCheckDigit = remainder < 2 ? 0 : 11 - remainder

    // Calculate second check digit using Brazilian CPF algorithm (same as codebase)
    const tenDigits = [...firstNineDigits, firstCheckDigit]
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += tenDigits[i] * (11 - i)
    }
    remainder = sum % 11
    const secondCheckDigit = remainder < 2 ? 0 : 11 - remainder

    // Combine all digits
    const allDigits = [...firstNineDigits, firstCheckDigit, secondCheckDigit]
    return allDigits.join('')
  }
}
