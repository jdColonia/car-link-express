import { RentalStatus } from "../../domain/entities/Rental";
import { errorHandler } from "../../domain/exceptions/exceptions";
import { MongoRentalRepository } from "../../infrastructure/repositories/rental.repository";
import { MongoVehicleUnavailabilityRepository } from "../../infrastructure/repositories/vehicle-unavailability.repository";
import { MongoVehicleRepository } from "../../infrastructure/repositories/vehicle.repository";
import { RentalService } from "../../infrastructure/services/rental.service";
import { Request, Response } from "express";

const rentalRepository = new MongoRentalRepository();
const vehicleRepository = new MongoVehicleRepository();
const vehicleUnavailabilityRepository =
  new MongoVehicleUnavailabilityRepository();
const rentalService = new RentalService(
  rentalRepository,
  vehicleRepository,
  vehicleUnavailabilityRepository
);

/**
 * Creates a new rental
 *
 * @param req - Express request object containing rental details in the body
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Creates a new rental with the provided details and marks the vehicle as unavailable
 * for the rental period.
 *
 * @response 201 - Rental successfully created
 * @response 400 - Invalid rental data or vehicle unavailable
 * @response 404 - Vehicle not found
 */
export const createRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.createRental(req.body);
    res.status(201).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Deletes a rental
 *
 * @param req - Express request object containing rental ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Deletes a rental by its ID.
 *
 * @response 204 - Rental successfully deleted
 * @response 404 - Rental not found
 */
export const deleteRental = async (req: any, res: any): Promise<void> => {
  try {
    await rentalService.deleteRental(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Retrieves a rental by ID
 *
 * @param req - Express request object containing rental ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves detailed information about a specific rental.
 *
 * @response 200 - Rental details
 * @response 404 - Rental not found
 */
export const getRentalById = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.getRentalById(req.params.id);
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Retrieves all rentals for the authenticated owner
 *
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves all rentals associated with the authenticated owner.
 *
 * @response 200 - List of owner's rentals
 * @response 401 - Authentication required
 * @response 404 - No rentals found
 */
export const getOwnerRents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const rentals = await rentalService.getRentalByOwnerId(req.user.id);
    res.status(200).json(rentals);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Retrieves all rentals for the authenticated client
 *
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves all rentals associated with the authenticated client.
 *
 * @response 200 - List of client's rentals
 * @response 401 - Authentication required
 * @response 404 - No rentals found
 */
export const getClientRents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const rentals = await rentalService.getRentalByClientId(req.user.id);
    res.status(200).json(rentals);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Retrieves all rentals in the system
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves all rentals in the system. Typically used by administrators.
 *
 * @response 200 - List of all rentals
 * @response 404 - No rentals found
 */
export const getAllRentals = async (req: any, res: any): Promise<void> => {
  try {
    const rentals = await rentalService.getAllRentals();
    res.status(200).json(rentals);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Updates a rental
 *
 * @param req - Express request object containing rental ID in params and update data in body
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Updates a rental with the provided data.
 *
 * @response 200 - Updated rental details
 * @response 404 - Rental not found
 * @response 400 - Update failed
 */
export const updateRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, req.body);
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Confirms a rental
 *
 * @param req - Express request object containing rental ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Updates a rental's status to CONFIRMED.
 *
 * @response 200 - Confirmed rental details
 * @response 404 - Rental not found
 * @response 400 - Confirmation failed
 */
export const confirmRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, {
      status: RentalStatus.CONFIRMED,
    });
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Cancels a rental
 *
 * @param req - Express request object containing rental ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Updates a rental's status to CANCELLED.
 *
 * @response 200 - Cancelled rental details
 * @response 404 - Rental not found
 * @response 400 - Cancellation failed
 */
export const cancelRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, {
      status: RentalStatus.CANCELLED,
    });
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};