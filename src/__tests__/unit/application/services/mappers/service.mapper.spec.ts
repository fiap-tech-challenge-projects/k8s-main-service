import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto } from '@application/services/dto'
import { ServiceMapper } from '@application/services/mappers'
import { Service } from '@domain/services/entities'
import { Price, EstimatedDuration } from '@domain/services/value-objects'

describe('ServiceMapper', () => {
  const mockService = new Service(
    'service-123',
    'Troca de óleo',
    Price.create('1000,00'),
    'Troca de óleo do motor',
    EstimatedDuration.create('00:50:00'),
    new Date('2023-01-01T10:00:00Z'),
    new Date('2023-01-02T10:00:00Z'),
  )

  beforeAll(() => {
    jest.spyOn(mockService, 'getFormattedPrice').mockReturnValue('R$ 1.000,00')
    jest.spyOn(mockService, 'getFormattedDuration').mockReturnValue('00:50:00')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('toResponseDto', () => {
    it('should map Service entity to ServiceResponseDto correctly', () => {
      const dto = ServiceMapper.toResponseDto(mockService)

      expect(dto).toEqual({
        id: 'service-123',
        name: 'Troca de óleo',
        price: 'R$ 1.000,00',
        description: 'Troca de óleo do motor',
        estimatedDuration: '00:50:00',
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z'),
      })
    })
  })

  describe('toResponseDtoArray', () => {
    it('should map array of Service entities to array of ServiceResponseDto', () => {
      const dtoArray = ServiceMapper.toResponseDtoArray([mockService, mockService])

      expect(dtoArray.length).toBe(2)
      expect(dtoArray[0]).toEqual(ServiceMapper.toResponseDto(mockService))
    })
  })

  describe('fromCreateDto', () => {
    it('should map CreateServiceDto to a new Service entity', () => {
      const createDto: CreateServiceDto = {
        name: 'Troca de óleo',
        price: '1000,00',
        description: 'Troca de óleo do motor',
        estimatedDuration: '00:50:00',
      }

      const createSpy = jest.spyOn(Service, 'create')

      createSpy.mockImplementation((name, priceStr, description, durationStr) => {
        const price = Price.create(priceStr)
        const duration = EstimatedDuration.create(durationStr)
        return new Service('service-id', name, price, description, duration, new Date(), new Date())
      })

      const service = ServiceMapper.fromCreateDto(createDto)

      expect(createSpy).toHaveBeenCalledWith(
        createDto.name,
        createDto.price,
        createDto.description,
        createDto.estimatedDuration,
      )
      expect(service).toBeInstanceOf(Service)

      createSpy.mockRestore()
    })
  })

  describe('fromUpdateDto', () => {
    it('should map UpdateServiceDto to an updated Service entity', () => {
      const updateDto: UpdateServiceDto = {
        name: 'Troca de óleo e filtro',
        price: '1200,00',
        description: 'Troca de óleo do motor e filtro de óleo',
        estimatedDuration: '01:00:00',
      }

      const updateNameSpy = jest.spyOn(mockService, 'updateName').mockImplementation(() => {})
      const updatePriceSpy = jest.spyOn(mockService, 'updatePrice').mockImplementation(() => {})
      const updateDescriptionSpy = jest
        .spyOn(mockService, 'updateDescription')
        .mockImplementation(() => {})
      const updateDurationSpy = jest
        .spyOn(mockService, 'updateEstimatedDuration')
        .mockImplementation(() => {})

      const updatedService = ServiceMapper.fromUpdateDto(updateDto, mockService)

      expect(updateNameSpy).toHaveBeenCalledWith(updateDto.name)
      expect(updatePriceSpy).toHaveBeenCalledWith(updateDto.price)
      expect(updateDescriptionSpy).toHaveBeenCalledWith(updateDto.description)
      expect(updateDurationSpy).toHaveBeenCalledWith(updateDto.estimatedDuration)
      expect(updatedService).toBe(mockService)

      updateNameSpy.mockRestore()
      updatePriceSpy.mockRestore()
      updateDescriptionSpy.mockRestore()
      updateDurationSpy.mockRestore()
    })
  })

  describe('ServiceResponseDto', () => {
    it('should have all required properties with correct types', () => {
      const dto: ServiceResponseDto = {
        id: 'service-123',
        name: 'Troca de óleo',
        price: '1000,00',
        description: 'Troca de óleo do motor',
        estimatedDuration: '00:50:00',
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z'),
      }

      expect(typeof dto.id).toBe('string')
      expect(typeof dto.name).toBe('string')
      expect(typeof dto.price).toBe('string')
      expect(typeof dto.description).toBe('string')
      expect(typeof dto.estimatedDuration).toBe('string')
      expect(dto.createdAt).toBeInstanceOf(Date)
      expect(dto.updatedAt).toBeInstanceOf(Date)
    })
  })
})
