import * as dto from '@application/service-orders/dto'
import * as mappers from '@application/service-orders/mappers'
import * as serviceOrderModule from '@application/service-orders/service-order.module'

describe('ServiceOrder Application Index', () => {
  it('should export all required modules', () => {
    expect(dto).toBeDefined()
    expect(mappers).toBeDefined()
    expect(serviceOrderModule).toBeDefined()
  })
})
