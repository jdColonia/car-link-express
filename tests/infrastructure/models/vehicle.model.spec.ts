import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import VehicleModel, { VehicleDocument } from '../../../src/infrastructure/models/vehicle.model';

// Define a type for Mongoose validation errors
interface MongooseError extends Error {
    errors?: {
        [key: string]: {
            message: string;
        };
    };
    code?: number;
}

describe('Vehicle Model', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await VehicleModel.deleteMany({});
    });

    it('should create a vehicle successfully', async () => {
        const vehicleData = {
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

        const vehicle = new VehicleModel(vehicleData);
        const savedVehicle = await vehicle.save();

        expect(savedVehicle._id).toBeDefined();
        expect(savedVehicle.vehicleModel).toBe(vehicleData.vehicleModel);
        expect(savedVehicle.make).toBe(vehicleData.make);
        expect(savedVehicle.license_plate).toBe(vehicleData.license_plate);
        expect(savedVehicle.createdAt).toBeDefined();
        expect(savedVehicle.updatedAt).toBeDefined();
    });

    it('should require required fields', async () => {
        const vehicleWithMissingFields = new VehicleModel({
            ownerId: '123456789012345678901234',
            // Missing required fields
        });

        let error: unknown;
        try {
            await vehicleWithMissingFields.save();
        } catch (err) {
            error = err;
        }

        const mongooseError = error as MongooseError;

        expect(error).toBeDefined();
        expect(mongooseError.errors).toBeDefined();
        expect(mongooseError.errors?.vehicleModel).toBeDefined();
        expect(mongooseError.errors?.make).toBeDefined();
        expect(mongooseError.errors?.license_plate).toBeDefined();
    });

    it('should enforce unique license plate', async () => {
        const vehicleData = {
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

        await new VehicleModel(vehicleData).save();

        const duplicateVehicle = new VehicleModel(vehicleData);

        let error: unknown;
        try {
            await duplicateVehicle.save();
        } catch (err) {
            error = err;
        }

        const mongooseError = error as MongooseError;
        expect(error).toBeDefined();
        expect(mongooseError.code).toBe(11000); // MongoDB duplicate key error code
    });
});