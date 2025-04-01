import { Request, Response } from 'express';
import { VehicleService } from '../../infrastructure/services/vehicle.service';
import { MongoVehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import {
    ForbiddenError,
    errorHandler
} from '../../domain/exceptions/exceptions';

const vehicleRepository = new MongoVehicleRepository();
const vehicleService = new VehicleService(vehicleRepository);

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            throw new ForbiddenError('Authentication required');
        }

        const vehicle = await vehicleService.createVehicle(req.user.id, req.body);
        res.status(201).json(vehicle);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.getVehicleById(req.params.id);
        res.status(200).json(vehicle);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

export const getVehicleByLicensePlate = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.getVehicleByLicensePlate(req.params.licensePlate);
        res.status(200).json(vehicle);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

export const getMyVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const vehicles = await vehicleService.getVehiclesByOwner(req.user.id);
        res.status(200).json(vehicles);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const updatedVehicle = await vehicleService.updateVehicle(
            req.params.id,
            req.user.id,
            req.body
        );
        res.status(200).json(updatedVehicle);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        await vehicleService.deleteVehicle(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error: any) {
        errorHandler(error, res);
    }
};