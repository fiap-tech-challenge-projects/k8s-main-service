import { VehicleDtoFactory, VehicleFactory } from '@/__tests__/factories'
import type { UpdateVehicleDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { Vehicle } from '@domain/vehicles/entities'

describe('VehicleMapper', () => {
  describe('toResponseDto', () => {
    it('should convert Vehicle entity to VehicleResponseDto', () => {
      const vehicle = VehicleFactory.create()

      const result = VehicleMapper.toResponseDto(vehicle)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('id', vehicle.id)
      expect(result).toHaveProperty('licensePlate', vehicle.getFormattedLicensePlate())
      expect(result).toHaveProperty('make', vehicle.make)
      expect(result).toHaveProperty('model', vehicle.model)
      expect(result).toHaveProperty('year', vehicle.year)
      expect(result).toHaveProperty('vin', '1HGBH41JXMN109186')
      expect(result).toHaveProperty('color', vehicle.color)
      expect(result).toHaveProperty('clientId', vehicle.clientId)
      expect(result).toHaveProperty('createdAt', vehicle.createdAt)
      expect(result).toHaveProperty('updatedAt', vehicle.updatedAt)
    })

    it('should handle vehicle without VIN and color', () => {
      const vehicle = VehicleFactory.createMinimal()

      const result = VehicleMapper.toResponseDto(vehicle)

      expect(result).toBeDefined()
      expect(result.vin).toBeUndefined()
      expect(result.color).toBeUndefined()
    })

    it('should handle vehicle with all properties', () => {
      const vehicle = VehicleFactory.createWithVin()

      const result = VehicleMapper.toResponseDto(vehicle)

      expect(result).toBeDefined()
      expect(result.vin).toBeDefined()
      expect(result.color).toBeDefined()
    })
  })

  describe('toResponseDtoArray', () => {
    it('should convert array of Vehicle entities to VehicleResponseDto array', () => {
      const vehicles = [VehicleFactory.create(), VehicleFactory.create(), VehicleFactory.create()]

      const result = VehicleMapper.toResponseDtoArray(vehicles)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(3)

      result.forEach((dto, index) => {
        const vehicle = vehicles[index]
        expect(dto.id).toBe(vehicle.id)
        expect(dto.licensePlate).toBe(vehicle.getFormattedLicensePlate())
        expect(dto.make).toBe(vehicle.make)
        expect(dto.model).toBe(vehicle.model)
        expect(dto.year).toBe(vehicle.year)
        expect(dto.clientId).toBe(vehicle.clientId)
      })
    })

    it('should return empty array for empty input', () => {
      const vehicles: Vehicle[] = []

      const result = VehicleMapper.toResponseDtoArray(vehicles)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })
  })

  describe('fromCreateDto', () => {
    it('should convert CreateVehicleDto to Vehicle entity', () => {
      const createDto = VehicleDtoFactory.createCreateVehicleDto()

      const result = VehicleMapper.fromCreateDto(createDto)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Vehicle)
      expect(result.licensePlate.value).toBe(createDto.licensePlate)
      expect(result.make).toBe(createDto.make)
      expect(result.model).toBe(createDto.model)
      expect(result.year).toBe(createDto.year)
      expect(result.clientId).toBe(createDto.clientId)
      expect(result.vin?.value).toBe(createDto.vin)
      expect(result.color).toBe(createDto.color)
    })

    it('should handle CreateVehicleDto without optional properties', () => {
      const createDto = VehicleDtoFactory.createMinimalCreateVehicleDto()

      const result = VehicleMapper.fromCreateDto(createDto)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Vehicle)
      expect(result.vin).toBeUndefined()
      expect(result.color).toBeUndefined()
    })

    it('should create vehicle with all properties', () => {
      const createDto = VehicleDtoFactory.createCreateVehicleDto({
        licensePlate: 'XYZ-9999',
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        clientId: 'client-999',
        vin: '1HGBH41JXMN109999',
        color: 'Red',
      })

      const result = VehicleMapper.fromCreateDto(createDto)

      expect(result).toBeDefined()
      expect(result.licensePlate.value).toBe('XYZ-9999')
      expect(result.make).toBe('Honda')
      expect(result.model).toBe('Civic')
      expect(result.year).toBe(2023)
      expect(result.clientId).toBe('client-999')
      expect(result.vin?.value).toBe('1HGBH41JXMN109999')
      expect(result.color).toBe('Red')
    })
  })

  describe('fromUpdateDto', () => {
    it('should convert UpdateVehicleDto to updated Vehicle entity', () => {
      const existingVehicle = VehicleFactory.create()
      const updateDto = VehicleDtoFactory.createUpdateVehicleDto()

      const result = VehicleMapper.fromUpdateDto(updateDto, existingVehicle)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Vehicle)
      expect(result.id).toBe(existingVehicle.id)
      expect(result.licensePlate.value).toBe(updateDto.licensePlate)
      expect(result.make).toBe(updateDto.make)
      expect(result.model).toBe(updateDto.model)
      expect(result.year).toBe(updateDto.year)
      expect(result.vin?.value).toBe(updateDto.vin)
      expect(result.color).toBe(updateDto.color)
    })

    it('should handle partial UpdateVehicleDto', () => {
      const existingVehicle = VehicleFactory.create()
      const updateDto = VehicleDtoFactory.createPartialUpdateVehicleDto({
        make: 'Updated Make',
        model: 'Updated Model',
      })

      const result = VehicleMapper.fromUpdateDto(updateDto, existingVehicle)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Vehicle)
      expect(result.id).toBe(existingVehicle.id)
      expect(result.make).toBe('Updated Make')
      expect(result.model).toBe('Updated Model')
      expect(result.licensePlate).toBe(existingVehicle.licensePlate)
      expect(result.year).toBe(2023)
    })

    it('should handle empty UpdateVehicleDto', () => {
      const existingVehicle = VehicleFactory.create()
      const updateDto: UpdateVehicleDto = {}

      const result = VehicleMapper.fromUpdateDto(updateDto, existingVehicle)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Vehicle)
      expect(result.id).toBe(existingVehicle.id)
      expect(result.licensePlate).toBe(existingVehicle.licensePlate)
      expect(result.make).toBe(existingVehicle.make)
      expect(result.model).toBe(existingVehicle.model)
      expect(result.year).toBe(existingVehicle.year)
      expect(result.vin).toBe(existingVehicle.vin)
      expect(result.color).toBe(existingVehicle.color)
    })

    it('should update only provided fields', () => {
      const existingVehicle = VehicleFactory.create()
      const updateDto = VehicleDtoFactory.createUpdateVehicleDto({
        licensePlate: 'NEW-1234',
        color: 'Blue',
        make: undefined,
        model: undefined,
        year: undefined,
        vin: undefined,
      })

      const result = VehicleMapper.fromUpdateDto(updateDto, existingVehicle)

      expect(result).toBeDefined()
      expect(result.licensePlate.value).toBe('NEW-1234')
      expect(result.color).toBe('Blue')
      expect(result.make).toBe(existingVehicle.make)
      expect(result.model).toBe(existingVehicle.model)
      expect(result.year).toBe(existingVehicle.year)
      expect(result.vin).toBe(existingVehicle.vin)
    })
  })
})
