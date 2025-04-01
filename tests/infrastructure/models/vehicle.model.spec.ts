import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import VehicleModel, { VehicleDocument } from '../../../src/infrastructure/models/vehicle.model';

interface MongooseError extends Error {
    errors?: { [key: string]: mongoose.Error.ValidatorError };
    code?: number;
}

describe('Vehicle Model', () => {
    let mongoServer: MongoMemoryServer;
    const mockVehicleData = {
        ownerId: '507f1f77bcf86cd799439011',
        vehicleModel: 'Model S',
        make: 'Tesla',
        color: 'Red',
        year: 2023,
        license_plate: 'TESLA123',
        url_photos: ['https://example.com/photo.jpg'],
        daily_price: 150,
        rental_conditions: 'No smoking allowed'
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await VehicleModel.deleteMany({});
    });

    describe('Create Operations', () => {
        it('should create a vehicle with valid data', async () => {
            const vehicle = new VehicleModel(mockVehicleData);
            const savedVehicle = await vehicle.save();

            expect(savedVehicle._id).toBeDefined();
            expect(savedVehicle.license_plate).toBe(mockVehicleData.license_plate);
            expect(savedVehicle.createdAt).toBeInstanceOf(Date);
            expect(savedVehicle.updatedAt).toBeInstanceOf(Date);
        });

        it('should auto-trim license plate whitespace', async () => {
            const vehicle = new VehicleModel({
                ...mockVehicleData,
                license_plate: '  ABC 123  '
            });

            const savedVehicle = await vehicle.save();
            expect(savedVehicle.license_plate).toBe('ABC 123');
        });
    });

    describe('Optional Fields', () => {
        it('should accept valid optional fields', async () => {
            const vehicle = new VehicleModel({
                ...mockVehicleData,
                class: 'Luxury',
                drive: 'AWD',
                fuel_type: 'Electric',
                transmission: 'Automatic',
                combination_mpg: 120,
                displacement: 2.0
            });

            const savedVehicle = await vehicle.save();
            expect(savedVehicle.class).toBe('Luxury');
            expect(savedVehicle.combination_mpg).toBe(120);
        });

        it('should ignore extra fields', async () => {
            const vehicle = new VehicleModel({
                ...mockVehicleData,
                invalidField: 'test'
            });

            const savedVehicle = await vehicle.save();
            expect(savedVehicle).not.toHaveProperty('invalidField');
        });
    });

    describe('Update Operations', () => {
        it('should update vehicle successfully', async () => {
            const vehicle = await new VehicleModel(mockVehicleData).save();
            const updatedData = { color: 'Black', daily_price: 200 };

            const updatedVehicle = await VehicleModel.findByIdAndUpdate(
                vehicle._id,
                updatedData,
                { new: true }
            );

            expect(updatedVehicle?.color).toBe('Black');
            expect(updatedVehicle?.daily_price).toBe(200);
        });
    });

    describe('Query Operations', () => {
        it('should find vehicles by owner', async () => {
            await new VehicleModel(mockVehicleData).save();
            const vehicles = await VehicleModel.find({ ownerId: mockVehicleData.ownerId });

            expect(vehicles).toHaveLength(1);
            expect(vehicles[0].license_plate).toBe(mockVehicleData.license_plate);
        });

        it('should return empty array for non-existent owner', async () => {
            const vehicles = await VehicleModel.find({ ownerId: 'invalidOwnerId' });
            expect(vehicles).toHaveLength(0);
        });
    });
});