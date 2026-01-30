import { InvalidDeliveryDateException } from '@domain/service-orders/exceptions'
import { ServiceOrderDeliveryDateValidator } from '@domain/service-orders/validators'

describe('ServiceOrderDeliveryDateValidator', () => {
  describe('validateDeliveryDate', () => {
    it('does not throw when delivery date is same or after requested date', () => {
      const requested = new Date('2025-01-01')
      const deliverySame = new Date('2025-01-01')
      const deliveryAfter = new Date('2025-01-02')

      expect(() =>
        ServiceOrderDeliveryDateValidator.validateDeliveryDate(deliverySame, requested),
      ).not.toThrow()

      expect(() =>
        ServiceOrderDeliveryDateValidator.validateDeliveryDate(deliveryAfter, requested),
      ).not.toThrow()
    })

    it('throws InvalidDeliveryDateException when delivery date is before the requested date', () => {
      const requested = new Date('2025-01-10')
      const delivery = new Date('2025-01-01')

      expect(() =>
        ServiceOrderDeliveryDateValidator.validateDeliveryDate(delivery, requested),
      ).toThrow(InvalidDeliveryDateException)
    })
  })
})
