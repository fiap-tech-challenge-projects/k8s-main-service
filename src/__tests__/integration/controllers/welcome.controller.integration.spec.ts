import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { IntegrationTestBase } from '../integration-test-base'

describe('WelcomeController (Integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const testBase = new IntegrationTestBase()
    await testBase.beforeAll()
    app = testBase.app
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('GET /', () => {
    it('should return welcome information', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200)

      expect(response.body).toMatchObject({
        message: 'Welcome to FIAP Tech Challenge API',
        version: '1.0.0',
        description: expect.any(String),
        timestamp: expect.any(String),
        endpoints: expect.any(Object),
      })

      expect(response.body.endpoints).toHaveProperty('welcome')
      expect(response.body.endpoints).toHaveProperty('clients')
      expect(response.body.endpoints).toHaveProperty('vehicles')
      expect(response.body.endpoints).toHaveProperty('services')
      expect(response.body.endpoints).toHaveProperty('employees')
    })

    it('should return valid timestamp', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200)

      const timestamp = new Date(response.body.timestamp)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('should have proper endpoint structure', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200)

      const endpoints = response.body.endpoints

      expect(endpoints.welcome).toMatchObject({
        description: expect.any(String),
        method: expect.any(String),
        path: expect.any(String),
      })

      expect(endpoints.clients).toMatchObject({
        description: expect.any(String),
        method: expect.any(String),
        path: expect.any(String),
      })
    })
  })
})
