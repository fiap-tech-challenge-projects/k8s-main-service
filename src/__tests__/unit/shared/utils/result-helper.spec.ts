import { ResultHelper } from '@shared/utils'

describe('ResultHelper', () => {
  describe('unwrapOrThrow', () => {
    it('returns the value when result is success', () => {
      const result = { isSuccess: true, value: 42 }

      const value = ResultHelper.unwrapOrThrow(result as any)

      expect(value).toBe(42)
    })

    it('throws the error when result is failure', () => {
      const error = new Error('failed')
      const result = { isSuccess: false, error }

      expect(() => ResultHelper.unwrapOrThrow(result as any)).toThrow(error)
    })
  })
})
