import { Request, Response } from 'express';
import { VehicleService } from '../../infrastructure/services/vehicle.service';
import { MongoVehicleRepository } from '../../infrastructure/repositories/vehicle.repository';

const vehicleRepository = new MongoVehicleRepository();
const vehicleService = new VehicleService(vehicleRepository);

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const vehicle = await vehicleService.createVehicle(req.user.id, req.body);
        res.status(201).json(vehicle);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.getVehicleById(req.params.id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        res.status(200).json(vehicle);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getVehicleByLicensePlate = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.getVehicleByLicensePlate(req.params.licensePlate);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        res.status(200).json(vehicle);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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

        if (!updatedVehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }

        res.status(200).json(updatedVehicle);
    } catch (error: any) {
        if (error.message === 'You are not the owner of this vehicle') {
            res.status(403).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const success = await vehicleService.deleteVehicle(req.params.id, req.user.id);
        if (!success) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }

        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'You are not the owner of this vehicle') {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};