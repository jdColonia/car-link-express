import request from 'supertest';
import express, { Express } from 'express';
import { json } from 'body-parser';
import vehicleRoutes from '../../../src/presentation/routes/vehicle.routes';
import * as vehicleController from '../../../src/presentation/controllers/vehicle.controller';
import { authenticate } from '../../../src/presentation/middlewares/auth.middleware';

// Mock the auth middleware
jest.mock('../../../src/api/middlewares/auth.middleware', () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { id: 'user123' };
        next();
    }),
}));

// Mock the controller methods
jest.mock('../../../src/api/controllers/vehicle.controller', () => ({
    createVehicle: jest.fn((req, res) => res.status(201).json({ id: 'new-vehicle' })),
    getAllVehicles: jest.fn((req, res) => res.status(200).json([{ id: 'vehicle1' }, { id: 'vehicle2' }])),
    getVehicleById: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    getVehicleByLicensePlate: jest.fn((req, res) => res.status(200).json({ license_plate: req.params.licensePlate })),
    getMyVehicles: jest.fn((req, res) => res.status(200).json([{ id: 'my-vehicle' }])),
    updateVehicle: jest.fn((req, res) => res.status(200).json({ id: req.params.id, ...req.body })),
    deleteVehicle: jest.fn((req, res) => res.status(204).send()),
}));

describe('Vehicle Routes', () => {
    let app: Express;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create a new Express app for each test
        app = express();
        app.use(json());
        app.use('/api/vehicles', vehicleRoutes);
    });

    describe('POST /api/vehicles', () => {
        it('should call createVehicle controller', async () => {
            const response = await request(app)
                .post('/api/vehicles')
                .send({ make: 'Toyota', model: 'Camry' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ id: 'new-vehicle' });
            expect(vehicleController.createVehicle).toHaveBeenCalled();
            expect(authenticate).toHaveBeenCalled();
        });
    });

    describe('GET /api/vehicles', () => {
        it('should call getAllVehicles controller', async () => {
            const response = await request(app)
                .get('/api/vehicles');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 'vehicle1' }, { id: 'vehicle2' }]);
            expect(vehicleController.getAllVehicles).toHaveBeenCalled();
        });
    });

    describe('GET /api/vehicles/my-vehicles', () => {
        it('should call getMyVehicles controller', async () => {
            const response = await request(app)
                .get('/api/vehicles/my-vehicles');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 'my-vehicle' }]);
            expect(vehicleController.getMyVehicles).toHaveBeenCalled();
            expect(authenticate).toHaveBeenCalled();
        });
    });

    describe('GET /api/vehicles/:id', () => {
        it('should call getVehicleById controller', async () => {
            const response = await request(app)
                .get('/api/vehicles/vehicle123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 'vehicle123' });
            expect(vehicleController.getVehicleById).toHaveBeenCalled();
        });
    });

    describe('GET /api/vehicles/license/:licensePlate', () => {
        it('should call getVehicleByLicensePlate controller', async () => {
            const response = await request(app)
                .get('/api/vehicles/license/ABC123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ license_plate: 'ABC123' });
            expect(vehicleController.getVehicleByLicensePlate).toHaveBeenCalled();
        });
    });

    describe('PUT /api/vehicles/:id', () => {
        it('should call updateVehicle controller', async () => {
            const response = await request(app)
                .put('/api/vehicles/vehicle123')
                .send({ color: 'Red' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 'vehicle123', color: 'Red' });
            expect(vehicleController.updateVehicle).toHaveBeenCalled();
            expect(authenticate).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/vehicles/:id', () => {
        it('should call deleteVehicle controller', async () => {
            const response = await request(app)
                .delete('/api/vehicles/vehicle123');

            expect(response.status).toBe(204);
            expect(vehicleController.deleteVehicle).toHaveBeenCalled();
            expect(authenticate).toHaveBeenCalled();
        });
    });
});