import { VehicleService } from '../../../src/infrastructure/services/vehicle.service';
import { VehicleRepository } from '../../../src/infrastructure/repositories/vehicle.repository';
import { Vehicle } from '../../../src/domain/entities/Vehicle';
import { CreateVehicleRequestDto, UpdateVehicleRequestDto } from '../../../src/domain/dtos/vehicle.dto';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variable
process.env.API_KEY = 'test-api-key';

describe('VehicleService', () => {
  let vehicleService: VehicleService;
  let mockRepository: jest.Mocked<VehicleRepository>;

  const mockVehicle: Vehicle = {
    id: '123',
    ownerId: 'owner123',
    vehicleModel: 'Camry',
    make: 'Toyota',
    color: 'Blue',
    year: 2020,
    license_plate: 'ABC123',
    url_photos: ['http://example.com/photo1.jpg'],
    daily_price: 50,
    rental_conditions: 'No smoking',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateDto: CreateVehicleRequestDto = {
    vehicleModel: 'Camry',
    make: 'Toyota',
    color: 'Blue',
    year: 2020,
    license_plate: 'ABC123',
    url_photos: ['http://example.com/photo1.jpg'],
    daily_price: 50,
    rental_conditions: 'No smoking',
  };

  const mockUpdateDto: UpdateVehicleRequestDto = {
    color: 'Red',
    daily_price: 60,
  };

  const mockApiResponse = {
    data: {
      class: 'mid-size',
      drive: 'fwd',
      fuel_type: 'gas',
      transmission: 'a',
      combination_mpg: 30,
      displacement: 2.5,
    }
  };

  beforeEach(() => {
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => { });

    // Create mock repository
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByLicensePlate: jest.fn(),
      findByOwner: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    vehicleService = new VehicleService(mockRepository);

    // Mock axios response
    mockedAxios.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    // Restaurar console.error
    (console.error as jest.Mock).mockRestore();

    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    it('should create a vehicle successfully', async () => {
      mockRepository.findByLicensePlate.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockVehicle);

      const result = await vehicleService.createVehicle('owner123', mockCreateDto);

      expect(mockRepository.findByLicensePlate).toHaveBeenCalledWith('ABC123');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        params: { make: 'Toyota', vehicleModel: 'Camry', year: 2020 },
        headers: { 'X-Api-Key': 'test-api-key' }
      });
      expect(result).toEqual(expect.objectContaining({
        id: '123',
        ownerId: 'owner123',
        vehicleModel: 'Camry',
      }));
    });

    it('should throw error if license plate already exists', async () => {
      mockRepository.findByLicensePlate.mockResolvedValue(mockVehicle);

      await expect(vehicleService.createVehicle('owner123', mockCreateDto))
        .rejects.toThrow('Vehicle with this license plate already exists');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle API error gracefully', async () => {
      mockRepository.findByLicensePlate.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockVehicle);
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      const result = await vehicleService.createVehicle('owner123', mockCreateDto);

      // Verificar que se llamó a console.error
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching vehicle data from API:',
        expect.any(Error)
      );

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: '123',
        ownerId: 'owner123',
      }));
    });
  });

  describe('getAllVehicles', () => {
    it('should return all vehicles', async () => {
      mockRepository.findAll.mockResolvedValue([mockVehicle, { ...mockVehicle, id: '456' }]);

      const result = await vehicleService.getAllVehicles();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should throw error if no vehicles found', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await expect(vehicleService.getAllVehicles())
        .rejects.toThrow('Vehicles not found');
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle by id', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);

      const result = await vehicleService.getVehicleById('123');

      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(expect.objectContaining({
        id: '123',
        ownerId: 'owner123',
      }));
    });

    it('should throw error if vehicle not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(vehicleService.getVehicleById('123'))
        .rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehicleByLicensePlate', () => {
    it('should return vehicle by license plate', async () => {
      mockRepository.findByLicensePlate.mockResolvedValue(mockVehicle);

      const result = await vehicleService.getVehicleByLicensePlate('ABC123');

      expect(mockRepository.findByLicensePlate).toHaveBeenCalledWith('ABC123');
      expect(result).toEqual(expect.objectContaining({
        license_plate: 'ABC123',
      }));
    });

    it('should throw error if vehicle not found', async () => {
      mockRepository.findByLicensePlate.mockResolvedValue(null);

      await expect(vehicleService.getVehicleByLicensePlate('ABC123'))
        .rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehiclesByOwner', () => {
    it('should return vehicles by owner', async () => {
      mockRepository.findByOwner.mockResolvedValue([mockVehicle]);

      const result = await vehicleService.getVehiclesByOwner('owner123');

      expect(mockRepository.findByOwner).toHaveBeenCalledWith('owner123');
      expect(result).toHaveLength(1);
      expect(result[0].ownerId).toBe('owner123');
    });

    it('should throw error if no vehicles found', async () => {
      mockRepository.findByOwner.mockResolvedValue([]);

      await expect(vehicleService.getVehiclesByOwner('owner123'))
        .rejects.toThrow('Vehicles not found');
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);
      mockRepository.update.mockResolvedValue({ ...mockVehicle, ...mockUpdateDto });

      const result = await vehicleService.updateVehicle('123', 'owner123', mockUpdateDto);

      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(mockRepository.update).toHaveBeenCalledWith('123', mockUpdateDto);
      expect(result.color).toBe('Red');
      expect(result.daily_price).toBe(60);
    });

    it('should throw error if vehicle not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(vehicleService.updateVehicle('123', 'owner123', mockUpdateDto))
        .rejects.toThrow('Vehicle not found');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user is not the owner', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);

      await expect(vehicleService.updateVehicle('123', 'different-owner', mockUpdateDto))
        .rejects.toThrow('You are not the owner of this vehicle');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if update fails', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);
      mockRepository.update.mockResolvedValue(null);

      await expect(vehicleService.updateVehicle('123', 'owner123', mockUpdateDto))
        .rejects.toThrow('Failed to update vehicle');
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);
      mockRepository.delete.mockResolvedValue(true);

      const result = await vehicleService.deleteVehicle('123', 'owner123');

      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(mockRepository.delete).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });

    it('should throw error if vehicle not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(vehicleService.deleteVehicle('123', 'owner123'))
        .rejects.toThrow('Vehicle not found');

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user is not the owner', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);

      await expect(vehicleService.deleteVehicle('123', 'different-owner'))
        .rejects.toThrow('You are not the owner of this vehicle');

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});