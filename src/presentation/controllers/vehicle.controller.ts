import { Request, Response } from 'express';
import { VehicleService } from '../../infrastructure/services/vehicle.service';
import { MongoVehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import {
    ForbiddenError,
    errorHandler
} from '../../domain/exceptions/exceptions';

const vehicleRepository = new MongoVehicleRepository();
const vehicleService = new VehicleService(vehicleRepository);

/**
 * Creates a new vehicle
 *
 * @param req - Express request object with authenticated user and vehicle details in body
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Creates a new vehicle listing for the authenticated user.
 * Fetches additional vehicle data from an external API.
 *
 * @response 201 - Vehicle successfully created
 * @response 401 - Authentication required
 * @response 400 - Invalid vehicle data or duplicate license plate
 */
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

/**
 * Retrieves all vehicles in the system
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves a list of all vehicles available in the system.
 *
 * @response 200 - List of all vehicles
 * @response 404 - No vehicles found
 */
export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

/**
 * Retrieves a vehicle by ID
 *
 * @param req - Express request object containing vehicle ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves detailed information about a specific vehicle.
 *
 * @response 200 - Vehicle details
 * @response 404 - Vehicle not found
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.getVehicleById(req.params.id);
        res.status(200).json(vehicle);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

/**
 * Retrieves a vehicle by license plate
 *
 * @param req - Express request object containing license plate in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves detailed information about a vehicle by its license plate.
 *
 * @response 200 - Vehicle details
 * @response 404 - Vehicle not found
 */
export const getVehicleByLicensePlate = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.getVehicleByLicensePlate(req.params.licensePlate);
        res.status(200).json(vehicle);
    } catch (error: any) {
        errorHandler(error, res);
    }
};

/**
 * Retrieves all vehicles owned by the authenticated user
 *
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves all vehicles listed by the authenticated user.
 *
 * @response 200 - List of user's vehicles
 * @response 401 - Authentication required
 * @response 404 - No vehicles found
 */
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

/**
 * Updates a vehicle
 *
 * @param req - Express request object with authenticated user, vehicle ID in params, and update data in body
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Updates a vehicle with the provided data. Only the owner can update their vehicle.
 *
 * @response 200 - Updated vehicle details
 * @response 401 - Authentication required
 * @response 403 - Not the owner of the vehicle
 * @response 404 - Vehicle not found
 */
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

/**
 * Deletes a vehicle
 *
 * @param req - Express request object with authenticated user and vehicle ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Deletes a vehicle from the system. Only the owner can delete their vehicle.
 *
 * @response 204 - Vehicle successfully deleted
 * @response 401 - Authentication required
 * @response 403 - Not the owner of the vehicle
 * @response 404 - Vehicle not found
 */
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