import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoVehicleRepository } from '../../../src/infrastructure/repositories/vehicle.repository';
import VehicleModel from '../../../src/infrastructure/models/vehicle.model';
import { Vehicle } from '../../../src/domain/entities/Vehicle';

describe('MongoVehicleRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repository: MongoVehicleRepository;
  let testVehicle: Vehicle;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new MongoVehicleRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await VehicleModel.deleteMany({});
    testVehicle = {
      id: '',
      ownerId: '123456789012345678901234',
      vehicleModel: 'Camry',
      make: 'Toyota',
      color: 'Blue',
      year: 2020,
      license_plate: 'ABC123',
      url_photos: ['http://example.com/photo1.jpg'],
      daily_price: 50,
      rental_conditions: 'No smoking',
    };
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const result = await repository.create(testVehicle);
      expect(result).toHaveProperty('id');
      expect(result.vehicleModel).toBe(testVehicle.vehicleModel);
      expect(result.make).toBe(testVehicle.make);
      expect(result.license_plate).toBe(testVehicle.license_plate);
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      await repository.create(testVehicle);
      await repository.create({
        ...testVehicle,
        license_plate: 'XYZ789',
      });

      const results = await repository.findAll();
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('id');
      expect(results[1]).toHaveProperty('id');
    });

    it('should return empty array when no vehicles exist', async () => {
      const results = await repository.findAll();
      expect(results).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find a vehicle by id', async () => {
      const created = await repository.create(testVehicle);
      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.license_plate).toBe(testVehicle.license_plate);
    });

    it('should return null if vehicle not found', async () => {
      const found = await repository.findById('123456789012345678901234');
      expect(found).toBeNull();
    });
  });

  describe('findByLicensePlate', () => {
    it('should find a vehicle by license plate', async () => {
      await repository.create(testVehicle);
      const found = await repository.findByLicensePlate(testVehicle.license_plate);
      expect(found).not.toBeNull();
      expect(found?.license_plate).toBe(testVehicle.license_plate);
    });

    it('should return null if license plate not found', async () => {
      const found = await repository.findByLicensePlate('NOTFOUND');
      expect(found).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('should find vehicles by owner id', async () => {
      await repository.create(testVehicle);
      await repository.create({
        ...testVehicle,
        license_plate: 'XYZ789',
      });

      const found = await repository.findByOwner(testVehicle.ownerId);
      expect(found).toHaveLength(2);
    });

    it('should return empty array if no vehicles found for owner', async () => {
      const found = await repository.findByOwner('nonexistentowner');
      expect(found).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const created = await repository.create(testVehicle);
      const updated = await repository.update(created.id, { color: 'Red' });
      expect(updated).not.toBeNull();
      expect(updated?.color).toBe('Red');
      expect(updated?.id).toBe(created.id);
    });

    it('should return null if vehicle not found', async () => {
      const updated = await repository.update('123456789012345678901234', { color: 'Red' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a vehicle', async () => {
      const created = await repository.create(testVehicle);
      const result = await repository.delete(created.id);
      expect(result).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false if vehicle not found', async () => {
      const result = await repository.delete('123456789012345678901234');
      expect(result).toBe(false);
    });
  });
});